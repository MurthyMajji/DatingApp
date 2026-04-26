import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Observable } from 'rxjs';
import { Member, MemberParams } from '../../../types/member';
import { AsyncPipe } from '@angular/common';
import { MemberCard } from '../../../layout/member/member-card/member-card';
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from '../../../shared/paginator/paginator';

@Component({
  selector: 'app-members-list',
  imports: [AsyncPipe, MemberCard, Paginator],
  templateUrl: './members-list.html',
  styleUrl: './members-list.css',
})
export class MembersList implements OnInit {
  private memberService = inject(MemberService);
  protected paginatedMembers = signal<PaginatedResult<Member> | null>(null);
  protected memberParams = new MemberParams();

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.memberParams).subscribe({
      next: (result) => {
        this.paginatedMembers.set(result);
      },
    });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.memberParams.pageSize = event.pageSize;
    this.memberParams.pageNumber = event.pageNumber;
    this.loadMembers();
  }
}
