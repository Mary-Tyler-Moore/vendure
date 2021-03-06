import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { normalizeString } from 'shared/normalize-string';

import { BaseDetailComponent } from '../../../common/base-detail.component';
import {
    CreateRoleInput,
    LanguageCode,
    Permission,
    Role,
    UpdateRoleInput,
} from '../../../common/generated-types';
import { _ } from '../../../core/providers/i18n/mark-for-extraction';
import { NotificationService } from '../../../core/providers/notification/notification.service';
import { DataService } from '../../../data/providers/data.service';
import { ServerConfigService } from '../../../data/server-config';

@Component({
    selector: 'vdr-role-detail',
    templateUrl: './role-detail.component.html',
    styleUrls: ['./role-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleDetailComponent extends BaseDetailComponent<Role> implements OnInit, OnDestroy {
    role$: Observable<Role>;
    detailForm: FormGroup;
    permissions: { [K in Permission]: boolean };
    permissionsChanged = false;
    constructor(
        router: Router,
        route: ActivatedRoute,
        serverConfigService: ServerConfigService,
        private changeDetector: ChangeDetectorRef,
        private dataService: DataService,
        private formBuilder: FormBuilder,
        private notificationService: NotificationService,
    ) {
        super(route, router, serverConfigService);
        this.permissions = Object.keys(Permission).reduce(
            (result, key) => ({ ...result, [key]: false }),
            {} as { [K in Permission]: boolean },
        );
        this.detailForm = this.formBuilder.group({
            code: ['', Validators.required],
            description: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.init();
        this.role$ = this.entity$;
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    updateCode(nameValue: string) {
        const codeControl = this.detailForm.get(['code']);
        if (codeControl && codeControl.pristine) {
            codeControl.setValue(normalizeString(nameValue, '-'));
        }
    }

    setPermission(change: { permission: string; value: boolean }) {
        this.permissions = { ...this.permissions, [change.permission]: change.value };
        this.permissionsChanged = true;
    }

    create() {
        const formValue = this.detailForm.value;
        const role: CreateRoleInput = {
            code: formValue.code,
            description: formValue.description,
            permissions: this.getSelectedPermissions(),
        };
        this.dataService.administrator.createRole(role).subscribe(
            data => {
                this.notificationService.success(_('common.notify-create-success'), { entity: 'Role' });
                this.detailForm.markAsPristine();
                this.changeDetector.markForCheck();
                this.permissionsChanged = false;
                this.router.navigate(['../', data.createRole.id], { relativeTo: this.route });
            },
            err => {
                this.notificationService.error(_('common.notify-create-error'), {
                    entity: 'Role',
                });
            },
        );
    }

    save() {
        this.role$
            .pipe(
                take(1),
                mergeMap(({ id }) => {
                    const formValue = this.detailForm.value;
                    const role: UpdateRoleInput = {
                        id,
                        code: formValue.code,
                        description: formValue.description,
                        permissions: this.getSelectedPermissions(),
                    };
                    return this.dataService.administrator.updateRole(role);
                }),
            )
            .subscribe(
                data => {
                    this.notificationService.success(_('common.notify-update-success'), { entity: 'Role' });
                    this.detailForm.markAsPristine();
                    this.changeDetector.markForCheck();
                    this.permissionsChanged = false;
                },
                err => {
                    this.notificationService.error(_('common.notify-update-error'), {
                        entity: 'Role',
                    });
                },
            );
    }

    protected setFormValues(role: Role, languageCode: LanguageCode): void {
        this.detailForm.patchValue({
            description: role.description,
            code: role.code,
        });
        for (const permission of Object.keys(this.permissions)) {
            this.permissions[permission] = role.permissions.includes(permission as Permission);
        }
    }

    private getSelectedPermissions(): Permission[] {
        return Object.keys(this.permissions).filter(p => this.permissions[p]) as Permission[];
    }
}
