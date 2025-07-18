import { byTestId, createComponentFactory, Spectator } from '@ngneat/spectator'; 
import { AppComponent } from './app.component';
import { Apollo } from 'apollo-angular';
import { UserService } from './services/user.service';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { ToastService } from './services/toast.service';

describe('AppComponent', () => {
    let spectator: Spectator<AppComponent>;
    let component: AppComponent;
    const mockUserService = jasmine.createSpyObj('UserService', [
        'getAllUsers',
        'getUserById',
        'createUser',
        'updateUser',
        'deleteUser',
        'toggleUserStatus',
        'searchUserByName',
        'searchUserByDomain',
        'deactivateAllUsers'
    ]);
    const mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    const mockToast = jasmine.createSpyObj('ToastService', ['success', 'error', 'info']);



    const createComponent = createComponentFactory({
        component: AppComponent,
        mocks: [Apollo],
        providers: [{ provide: UserService, useValue: mockUserService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ToastService, useValue: mockToast }
        ]
    });

    beforeEach(() => {
        mockUserService.getAllUsers.and.returnValue(of({
            data: {
                users: [
                    { id: '1', name: 'John Doe', email: 'john@example.com', active: true },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: true }
                ]
            }
        }));

        spectator = createComponent();
        component = spectator.component;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
        expect(component.activeUsers()).toBe(2);
        expect(component.inactiveUsers()).toBe(0);
        expect(component.users().length).toBe(2)

        const listItems = spectator.queryAll(byTestId('user-item'));
        expect(listItems.length).toBe(2);
        expect(listItems[0].textContent).toContain("John Doe");
        expect(listItems[1].textContent).toContain("Jane Smith");
    });
    it('getAllUsers() have called in oninit()', () => {
        expect(mockUserService.getAllUsers).toHaveBeenCalled();
    })

    it('it should trigger search by name', () => {
        mockUserService.searchUserByName.and.returnValue(of({
            data: {
                searchUser: [
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: true }
                ]
            }
        }));
        component.searchKey.set("Jane Smith");
        component.searchMode.set("name");
        component.search();
        spectator.detectChanges();
        expect(component.searchUsers().length).toBe(1)
        const listItems = spectator.queryAll(byTestId('user-item'));
        expect(listItems.length).toBe(1);
        expect(listItems[0].textContent).toContain("Jane");

    })
    it('should search by domain and set result', () => {
        mockUserService.searchUserByDomain.and.returnValue(of({
            data: {
                searchUsersByDomain: [
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: true }
                ]
            }
        }));
        component.searchKey.set("example");
        component.searchMode.set("domain");
        component.search();
        spectator.detectChanges();
        expect(component.searchUsers().length).toBe(1)
        const listItems = spectator.queryAll(byTestId('user-item'));
        expect(listItems.length).toBe(1);
        expect(listItems[0].textContent).toContain("example");
    })

    it('should deactivate all users on click of deactivate button', () => {
        mockUserService.deactivateAllUsers.and.returnValue(of({ data: { deactivateAllUsers: true } }));
        mockUserService.getAllUsers.and.returnValue(of({
            data: {
                users: [
                    { id: '1', name: 'John Doe', email: 'john@example.com', active: false },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: false }
                ]
            }
        }));
        spyOn(component, 'deactivateAll').and.callThrough();
        component.deactivateAll();
        spectator.click('button[color="warn"]');
        spectator.detectChanges();

        expect(component.deactivateAll).toHaveBeenCalled();
        expect(mockUserService.deactivateAllUsers).toHaveBeenCalled();

        expect(component.activeUsers()).toBe(0);
        expect(component.inactiveUsers()).toBe(2);
        expect(mockToast.success).toHaveBeenCalledWith('All users deactivated')
    });

    it('should add user and show snackbar', () => {
        mockUserService.createUser.and.returnValue(of({ data: {} }));;
        mockUserService.getAllUsers.and.returnValue(of({
            data: {
                users: [
                    { id: '1', name: 'John Doe', email: 'john@example.com', active: true },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: true },
                    { id: '3', name: 'Anu', email: 'Anu@abc.com', active: true }
                ]
            }
        }));
        component.name.set('Anu');
        component.email.set('Anu@abc.com');
        component.addUser();
        spectator.detectChanges();
        expect(mockUserService.createUser).toHaveBeenCalledWith('Anu', 'Anu@abc.com');
        expect(mockToast.success).toHaveBeenCalledWith("User added successfully");
        const listItems = spectator.queryAll(byTestId('user-item'));
        expect(listItems.length).toBe(3);

    });
    it('should update user and show snackbar', () => {
        component.id.set('1');
        component.name.set('Sam');
        component.email.set('sam@example.com');
        mockUserService.updateUser.and.returnValue(of({ data: {} }));
        mockUserService.getAllUsers.and.returnValue(of({
            data: {
                users: [
                    { id: '1', name: 'Sam', email: 'sam@example.com', active: true },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: true },
                    { id: '3', name: 'Anju', email: 'Anju@abc.com', active: true },
                    { id: '4', name: 'Anu', email: 'Anu@abc.com', active: true }
                ]
            }
        }));

        component.updateUsers();
        spectator.detectChanges();
        expect(mockUserService.updateUser).toHaveBeenCalledWith('1', 'Sam', 'sam@example.com');
        expect(mockToast.success).toHaveBeenCalledWith("User updated successfully");
        const listItems = spectator.queryAll(byTestId('user-item'));
        expect(listItems.length).toBe(4);
        expect(listItems[0].textContent).toContain("Sam");
    });
    it('should delete user and show snackbar', () => {
        component.id.set('1');
        mockUserService.deleteUser.and.returnValue(of(true));
        component.deleteUser();
        spectator.detectChanges();
        expect(mockUserService.deleteUser).toHaveBeenCalledOnceWith('1');
        expect(mockToast.success).toHaveBeenCalledWith("User deleted successfully");
    })

    it('should toggle user status', () => {
        mockUserService.toggleUserStatus.and.returnValue(of({ data: {} }));
        component.toggleStatus("1");
        spectator.detectChanges();
        expect(mockUserService.toggleUserStatus).toHaveBeenCalledOnceWith("1");

    })
    it('should compute active/inactive user count correctly', () => {
        mockUserService.getAllUsers.and.returnValue(of({
            data: {
                users: [
                    { id: '1', name: 'Sam', email: 'sam@example.com', active: true },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: true },
                    { id: '3', name: 'Anju', email: 'Anju@abc.com', active: false },
                    { id: '4', name: 'Anu', email: 'Anu@abc.com', active: true }
                ]
            }
        }));
        component.fetchUsers();
        spectator.detectChanges();
        expect(component.activeUsers()).toBe(3);
        expect(component.inactiveUsers()).toBe(1);
    })

    it('should reset user fields', () => {
        component.name.set("Anju");
        component.email.set("anju@email.com");
        component.id.set('123');
        component.action.set('Update');
        spectator.click(byTestId('cancel'));
        spectator.detectChanges();
        expect(component.name()).toBe('');
        expect(component.email()).toBe('');
        expect(component.id()).toBe('');
        expect(component.action()).toBe('Add');

    })

});
