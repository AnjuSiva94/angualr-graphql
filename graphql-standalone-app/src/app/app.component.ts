import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { signal } from '@angular/core';
import { UserService } from './services/user.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { User } from './interfaces/user.interface'
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatRadioModule,
    MatSnackBarModule
  ],
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss'
})


export class AppComponent {


  private apollo = inject(Apollo);
  users = signal<User[]>([]);
  name = signal<string>('');
  email = signal<string>('');
  id = signal<string>('');
  action = signal<string>('Add');
  searchMode = signal<'name' | 'domain'>('name');
  searchKey = signal<string>('');
  searchUsers = signal<User[]>([]);
  searchflag = signal<boolean>(false);

  constructor(private userService: UserService, private toastService: ToastService) { }

  ngOnInit() {
    this.fetchUsers();

  }
  fetchUsers() {
    debugger;
    this.userService.getAllUsers({ fetchPolicy: 'network-only' }).subscribe((result: any) => {
      this.users.set(result.data.users);
    });
  }

  takeAction() {
    switch (this.action()) {
      case 'Add': return this.addUser();
      case 'Update': return this.updateUsers();
      case 'Delete': return this.deleteUser();
    }
    this.searchflag.set(false);
    this.searchKey.set('');

  }
  addUser() {
    this.userService.createUser(this.name(), this.email())
      .subscribe(result => {
        this.fetchUsers();

        console.log("hi1");
        this.toastService.success('User added successfully');

        console.log("hi2");
        this.resetUser()
      });

  }
  updateUsers() {
    this.userService.updateUser(this.id(), this.name(), this.email())
      .subscribe(result => {
        this.fetchUsers();
        this.toastService.success('User updated successfully');
        this.resetUser()
      });

  }
  deleteUser() {
    this.userService.deleteUser(this.id())
      .subscribe(result => {
        this.fetchUsers();
        this.toastService.success('User deleted successfully');
        this.resetUser();
      });

  }
  getUser(id?: null | string, action?: null | string) {
    id == null ? this.id() : id
    this.action.set(action?.toString() ?? '')
    this.userService.getUser(id?.toString() ?? '').subscribe((result: any) => {
      let user = result.data.user;
      this.selectedUser(user)
    })
  }

  selectedUser(user: User) {
    this.name.set(user.name)
    this.email.set(user.email)
    this.id.set(user.id)
  }

  resetUser() {
    this.action.set('Add');
    this.name.set('');
    this.email.set('');
    this.id.set('');
    this.searchflag.set(false);
  }
  search() {
    const key = this.searchKey().trim();
    if (!key) {
      this.searchflag.set(false); // 👈 Add this line
      this.searchUsers.set([]);
      return;
    }
    this.searchflag.set(true);
    if (this.searchMode() === "name") {
      this.userService.searchUserByName(key).subscribe((result: any) => {
        const data = result.data.searchUser;
        if (!data) {
          this.searchUsers.set([]);
        } else {
          this.searchUsers.set(Array.isArray(data) ? data : [data]);
        }
      });
    } else {
      this.userService.searchUserByDomain(key).subscribe((result: any) => {
        const data = result.data.searchUsersByDomain;
        if (!data || data.length === 0) {
          this.searchUsers.set([]);
        } else {
          this.searchUsers.set(data);
        }
      });
    }
  }


  toggleStatus(id: string) {
    this.userService.toggleUserStatus(id).subscribe(result => {
      this.fetchUsers();
    });
  }
  deactivateAll() {
    this.userService.deactivateAllUsers().subscribe(result => {
      this.fetchUsers();
      this.toastService.success('All users deactivated');
    });
  }
  displayedUsers = computed(() =>
    this.searchflag() ? this.searchUsers() : this.users()
  );

  activeUsers = computed(() => this.users().filter(u => u.active).length);
  inactiveUsers = computed(() => this.users().filter(u => !u.active).length);

}
