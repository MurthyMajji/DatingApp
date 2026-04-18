import { CanDeactivateFn } from '@angular/router';
import { MemberProfile } from '../../layout/member/member-profile/member-profile';

export const profileUnsavedChangesGuardGuard: CanDeactivateFn<MemberProfile> = (component) => {
  if (component.profileForm.dirty) {
    return confirm('You have unsaved changes. Are you sure, want to leave?');
  }
  return true;
};
