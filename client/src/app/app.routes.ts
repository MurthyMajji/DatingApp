import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { MembersDetails } from './pages/members/members-details/members-details';
import { MembersList } from './pages/members/members-list/members-list';
import { Lists } from './pages/lists/lists';
import { Messages } from './pages/messages/messages';
import { authGuard } from './core/guards/auth-guard';
import { NotFound } from './shared/errors/not-found/not-found';
import { ServerError } from './shared/errors/server-error/server-error';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'members', component: MembersList },
      { path: 'members/:id', component: MembersDetails },
      { path: 'lists', component: Lists },
      { path: 'messages', component: Messages },
    ],
  },
  { path: 'server-error', component: ServerError },
  { path: '**', component: NotFound },
];
