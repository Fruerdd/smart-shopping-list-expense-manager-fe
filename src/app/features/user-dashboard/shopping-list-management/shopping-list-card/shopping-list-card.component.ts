import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ShoppingListDTO} from '@app/models/shopping-list.dto';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {CollaboratorDTO} from '@app/models/collaborator.dto';
import {AuthService} from '@app/services/auth.service';
import {UserProfileService} from '@app/services/user-profile.service';
import {CommonModule} from '@angular/common';
import {ImageUrlService} from '@app/services/image-url.service';
import {ConfirmationPopupComponent} from '../shared/confirmation-popup.component';

@Component({
  selector: 'app-shopping-list-card',
  standalone: true,
  imports: [MatIcon, MatIconModule, CommonModule, ConfirmationPopupComponent],
  templateUrl: './shopping-list-card.component.html',
  styleUrls: ['./shopping-list-card.component.css']
})
export class ShoppingListCardComponent implements OnInit {
  @Input() shoppingList!: ShoppingListDTO;
  @Output() viewSharedUsers = new EventEmitter<{
    collaborators: CollaboratorDTO[],
    listId: string,
    isOwner: boolean
  }>();
  @Output() viewList = new EventEmitter<ShoppingListDTO>();
  @Output() markListAsDone = new EventEmitter<string>();

  protected userId: string;
  ownerAvatarUrl: string | null = null;
  randomListImageUrl: string;
  showMarkDoneConfirmation = false;

  constructor(
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private imageUrlService: ImageUrlService
  ) {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('User must be logged in');
    }
    this.userId = currentUserId;
    this.randomListImageUrl = this.getRandomListImage();
  }

  ngOnInit() {
    if (!this.shoppingList.ownerAvatar && this.shoppingList.ownerId) {
      this.loadOwnerAvatar();
    } else {
      this.ownerAvatarUrl = this.getFullImageUrl(this.shoppingList.ownerAvatar);
    }
  }

  private loadOwnerAvatar() {
    this.userProfileService.getUserProfileById(this.shoppingList.ownerId).subscribe({
      next: (ownerProfile) => {
        this.ownerAvatarUrl = this.getFullImageUrl(ownerProfile.avatar);
      },
      error: (error) => {
        this.ownerAvatarUrl = null;
      }
    });
  }

  getOwnerAvatarUrl(): string {
    return this.ownerAvatarUrl || '/assets/images/avatar.png';
  }

  getFullImageUrl(avatarPath: string | null | undefined): string | null {
    return this.imageUrlService.getFullImageUrl(avatarPath);
  }

  setDefaultImage(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/avatar.png';
  }

  onViewSharedUsers(listId: string, isOwner: boolean): void {
    this.viewSharedUsers.emit({
      collaborators: this.shoppingList.collaborators,
      listId,
      isOwner
    });
  }

  onViewList(): void {
    this.viewList.emit(this.shoppingList);
  }

  onMarkAsDone(event: Event): void {
    event.stopPropagation();
    this.showMarkDoneConfirmation = true;
  }

  onConfirmMarkAsDone(): void {
    this.showMarkDoneConfirmation = false;
    this.markListAsDone.emit(this.shoppingList.id);
  }

  onCancelMarkAsDone(): void {
    this.showMarkDoneConfirmation = false;
  }

  private getRandomListImage(): string {
    const listImages = [
      'assets/images/list-img-generic1.png',
      'assets/images/list-img-generic2.png',
      'assets/images/list-img-generic3.png',
      'assets/images/list-img-generic4.png',
      'assets/images/list-img-generic5.png'
    ];

    const randomIndex = Math.floor(Math.random() * listImages.length);
    return listImages[randomIndex];
  }
}
