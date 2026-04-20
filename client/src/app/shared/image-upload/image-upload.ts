import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
})
export class ImageUpload {
  protected imgSrc = signal<string | ArrayBuffer | null | undefined>(null);
  protected isDragOver = false;
  private fileToUpload: File | null = null;
  uploadFile = output<File>();
  loading = input<boolean>(false);

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  protected onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  protected onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      this.previewImage(file);
      this.fileToUpload = file;
    }
  }

  protected onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    console.log(fileInput.files);
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      this.previewImage(file);
      this.fileToUpload = file;
    }
  }

  private previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imgSrc.set(e.target?.result);
    };
    reader.readAsDataURL(file);
  }

  protected onCancel() {
    this.fileToUpload = null;
    this.imgSrc.set(null);
  }

  protected onUpload() {
    if (this.fileToUpload) {
      this.uploadFile.emit(this.fileToUpload);
    }
  }
}
