import { byTestId, createComponentFactory, Spectator } from '@ngneat/spectator'; // or '@ngneat/spectator/jest'
import { AppComponent } from './app.component';
import { Apollo } from 'apollo-angular';
import { UserService } from './services/user.service';
import { of } from 'rxjs';

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
        'deactivateAllUsers'
    ]);


    mockUserService.searchUserByName.and.returnValue(of({
        data: {
            searchUser: [
                { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: true }
            ]
        }
    }));

    const createComponent = createComponentFactory({
        component: AppComponent,
        mocks: [Apollo],
        providers: [{ provide: UserService, useValue: mockUserService }]
    });

    beforeEach(() => {
        // ✅ Mock with correct GraphQL response shape
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
        component.searchKey.set("Jane Smith");
        component.searchMode.set("name");
        component.search();
        spectator.detectChanges();
        expect(component.searchUsers().length).toBe(1)
        const listItems = spectator.queryAll(byTestId('user-item'));
        expect(listItems.length).toBe(1);
        expect(listItems[0].textContent).toContain("Jane");

    })
    it('should deactivate all users on click of deactivate button', () => {
        // Simulate deactivation success
        mockUserService.deactivateAllUsers.and.returnValue(of({ data: { deactivateAllUsers: true } }));

        // After deactivation, fetch all users with updated status
        mockUserService.getAllUsers.and.returnValue(of({
            data: {
                users: [
                    { id: '1', name: 'John Doe', email: 'john@example.com', active: false },
                    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: false }
                ]
            }
        }));

        spyOn(component, 'deactivateAll').and.callThrough();

        spectator.click('button[color="warn"]');
        spectator.detectChanges();

        expect(component.deactivateAll).toHaveBeenCalled();
        expect(mockUserService.deactivateAllUsers).toHaveBeenCalled();

        expect(component.activeUsers()).toBe(0);
        expect(component.inactiveUsers()).toBe(2);
    });



});
