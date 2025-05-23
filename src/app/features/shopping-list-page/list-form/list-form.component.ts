import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListTypeEnum } from '@app/models/shopping-list.dto';
import { UserProfileService } from '@app/services/user-profile.service';
import { UserDTO } from '@app/models/user.dto';

export interface ShareOption {
  userId: string;
  userName: string;
}

export interface ListFormValues {
  name: string;
  description: string;
  listType: ListTypeEnum;
  shareWith: string[];
}

@Component({
  selector: 'app-list-form',
  templateUrl: './list-form.component.html',
  styleUrls: ['./list-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ListFormComponent implements OnInit {
  @Input() isEditMode = false;
  @Input() initialValues: ListFormValues = {
    name: '',
    description: '',
    listType: ListTypeEnum.OTHER,
    shareWith: []
  };
  @Output() formValuesChange = new EventEmitter<ListFormValues>();

  listForm!: FormGroup;
  listTypes = Object.values(ListTypeEnum);
  shareOptions: ShareOption[] = [];
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private userProfileService: UserProfileService
  ) {
    const userInfo = localStorage.getItem('userInfo');
    this.userId = userInfo ? JSON.parse(userInfo).id : '';
  }

  private userId: string;

  ngOnInit(): void {
    this.initializeForm();
    this.loadFriends();

    // Watch for initialValues changes
    if (this.isEditMode) {
      this.listForm.patchValue(this.initialValues);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues'] && !changes['initialValues'].firstChange) {
      this.listForm.patchValue(this.initialValues);
    }
  }

  private initializeForm(): void {
    this.listForm = this.formBuilder.group({
      name: [this.initialValues.name || '', Validators.required],
      description: [this.initialValues.description || ''],
      listType: [this.initialValues.listType || ListTypeEnum.OTHER],
      shareWith: [this.initialValues.shareWith || []]
    });

    this.listForm.valueChanges.subscribe(values => {
      this.formValuesChange.emit(values);
    });
  }

  private loadFriends(): void {
    if (!this.userId) {
      console.error('User ID not found');
      return;
    }

    this.isLoading = true;
    this.userProfileService.getUserFriends(this.userId).subscribe({
      next: (friends: UserDTO[]) => {
        this.shareOptions = friends.map(friend => ({
          userId: friend.id,
          userName: friend.name
        }));
        
        // If in edit mode and we have initial share values, ensure they exist in options
        if (this.isEditMode && this.initialValues.shareWith?.length > 0) {
          const existingFriendIds = new Set(this.shareOptions.map(f => f.userId));
          const missingCollaborators = this.initialValues.shareWith
            .filter(userId => !existingFriendIds.has(userId));

          // Add any missing collaborators to the share options
          if (missingCollaborators.length > 0) {
            this.userProfileService.getUsersByIds(missingCollaborators).subscribe({
              next: (users: UserDTO[]) => {
                const additionalOptions = users.map(user => ({
                  userId: user.id,
                  userName: user.name
                }));
                this.shareOptions = [...this.shareOptions, ...additionalOptions];
              },
              error: (error: Error) => {
                console.error('Error loading additional collaborators:', error);
              }
            });
          }
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading friends:', error);
        this.isLoading = false;
      }
    });
  }

  toggleShareOption(userId: string): void {
    const currentSelections = this.listForm.get('shareWith')?.value || [];
    const index = currentSelections.indexOf(userId);

    if (index === -1) {
      currentSelections.push(userId);
    } else {
      currentSelections.splice(index, 1);
    }

    this.listForm.patchValue({ shareWith: currentSelections });
  }

  isShareOptionSelected(userId: string): boolean {
    const currentSelections = this.listForm.get('shareWith')?.value || [];
    return currentSelections.includes(userId);
  }

  getFormValues(): ListFormValues {
    return this.listForm.value;
  }

  isFormValid(): boolean {
    return this.listForm.valid;
  }

  reset(): void {
    this.listForm.reset(this.initialValues);
  }
}
