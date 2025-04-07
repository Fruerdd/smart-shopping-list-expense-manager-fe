import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {ShareOption} from '@app/services/shopping-list-page.service';

@Component({
  selector: 'app-list-form',
  templateUrl: './list-form.component.html',
  styleUrls: ['./list-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ListFormComponent implements OnInit {
  @Input() isEditMode = false;
  @Input() initialValues: any = {};
  @Output() formValuesChange = new EventEmitter<any>();

  listForm!: FormGroup;

  shareOptions: ShareOption[] = [
    { id: 'emir', name: 'Emir' },
    { id: 'sara', name: 'Sara' },
    { id: 'monika', name: 'Monika' },
    { id: 'adna', name: 'Adna' },
  ];

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.listForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      type: ['other'],
      shareWith: [[]]
    });

    if (this.initialValues) {
      this.listForm.patchValue(this.initialValues);
    }

    this.listForm.valueChanges.subscribe(values => {
      this.formValuesChange.emit(values);
    });
  }

  toggleShareOption(optionId: string): void {
    const currentSelections = this.listForm.get('shareWith')?.value || [];
    const index = currentSelections.indexOf(optionId);

    if (index === -1) {
      currentSelections.push(optionId);
    } else {
      currentSelections.splice(index, 1);
    }

    this.listForm.patchValue({ shareWith: currentSelections });
  }

  isShareOptionSelected(optionId: string): boolean {
    const currentSelections = this.listForm.get('shareWith')?.value || [];
    return currentSelections.includes(optionId);
  }

  getFormValues(): any {
    return this.listForm.value;
  }

  isFormValid(): boolean {
    return this.listForm.valid;
  }
}
