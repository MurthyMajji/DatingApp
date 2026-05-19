import { Component, inject, OnInit, signal } from '@angular/core';
import { MessageService } from '../../core/services/message-service';
import { PaginatedResult } from '../../types/pagination';
import { Message, MessagesParams } from '../../types/message';
import { Paginator } from '../../shared/paginator/paginator';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DeleteButton } from '../../shared/delete-button/delete-button';
import { Modal } from '../../shared/modal/modal';

@Component({
  selector: 'app-messages',
  imports: [Paginator, RouterLink, DatePipe, DeleteButton, Modal],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnInit {
  private messageService = inject(MessageService);
  protected messagesParams = new MessagesParams();
  protected paginatedMessages = signal<PaginatedResult<Message> | null>(null);
  tabs = [
    { label: 'Inbox', value: 'Inbox' },
    { label: 'Outbox', value: 'Outbox' },
  ];
  protected fetchedContainer = 'Inbox';
  protected isModalOpen = signal<boolean>(false);
  protected deleteMsgId = '';

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(this.messagesParams).subscribe({
      next: (response) => {
        this.paginatedMessages.set(response);
        this.fetchedContainer = this.messagesParams.container;
      },
    });
  }

  deleteMessages() {
    this.messageService.deleteMessage(this.deleteMsgId).subscribe({
      next: () => {
        const currentMessages = this.paginatedMessages();
        if (currentMessages?.items) {
          this.paginatedMessages.update((prev) => {
            if (!prev) return prev;
            const newMessages =
              prev.items.filter((message) => message.id !== this.deleteMsgId) || [];
            return {
              metaData: prev.metaData,
              items: newMessages,
            };
          });
        }
      },
      complete: () => {
        this.deleteMsgId = '';
        this.isModalOpen.set(false);
      },
    });
  }

  get isInbox() {
    return this.fetchedContainer === 'Inbox';
  }

  setContainer(container: string) {
    this.messagesParams.container = container;
    this.messagesParams.pageNumber = 1;
    this.loadMessages();
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.messagesParams.pageSize = event.pageSize;
    this.messagesParams.pageNumber = event.pageNumber;
    this.loadMessages();
  }

  setModalOpen(event: Event, id: string) {
    event.stopPropagation();
    this.deleteMsgId = id;
    this.isModalOpen.set(true);
  }

  cancel() {
    this.isModalOpen.set(false);
  }

  confirm() {
    this.deleteMessages();
  }
}
