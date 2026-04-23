import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { Member, Photo } from '../../../types/member';
import { ImageUpload } from '../../../shared/image-upload/image-upload';
import { AccountServices } from '../../../core/services/account-services';
import { IUser } from '../../../types/user';
import { StarButton } from '../../../shared/star-button/star-button';
import { DeleteButton } from '../../../shared/delete-button/delete-button';

@Component({
  selector: 'app-member-photos',
  imports: [ImageUpload, StarButton, DeleteButton],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  protected memberService = inject(MemberService);
  protected accountService = inject(AccountServices);
  private route = inject(ActivatedRoute);
  protected photos = signal<Photo[]>([]);
  protected loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadMemberPhotos();
  }

  loadMemberPhotos() {
    const memberId = this.route.parent?.snapshot.paramMap.get('id');
    if (!memberId) return;
    this.memberService.getMemberPhotos(memberId).subscribe((photos) => {
      this.photos.set(photos);
    });
  }

  onUploadImage(file: File) {
    this.loading.set(true);
    this.memberService.uploadPhoto(file).subscribe({
      next: (photo) => {
        this.photos.update((photos) => [...photos, photo]);
        if (!this.memberService.member()?.imageUrl) {
          this.setAsMainPhoto(photo);
        }
        this.loading.set(false);
        this.memberService.editMode.set(false);
      },
      error: (err) => {
        console.error('Error uploading photo:', err);
        this.loading.set(false);
      },
    });
  }

  setProfilePhoto(photo: Photo) {
    this.memberService.setProfilePhoto(photo.id).subscribe({
      next: () => {
        this.setAsMainPhoto(photo);
      },
      error: (err) => {
        console.error('Error setting profile photo:', err);
      },
    });
  }

  deletePhoto(photoId: number) {
    this.memberService.deletePhoto(photoId).subscribe({
      next: () => {
        this.photos.update((photos) => photos.filter((photo) => photo.id !== photoId));
      },
    });
  }

  private setAsMainPhoto(photo: Photo) {
    const currentUser = this.accountService.currentUser();
    if (currentUser) {
      this.accountService.setCurrentUser({
        ...currentUser,
        imageUrl: photo.url,
      } as IUser);
    }
    this.memberService.member.update(
      (member) =>
        ({
          ...member,
          imageUrl: photo.url,
        }) as Member,
    );
  }
}
