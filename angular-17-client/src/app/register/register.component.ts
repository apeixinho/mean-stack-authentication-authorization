import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import {uRole} from "../model/uRole";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form: any = {
    username: null,
    email: null,
    password: null,
    roles: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  userRoles: uRole[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.getUserRoles();
  }



  getUserRoles(): void {
    this.authService.userRoles().subscribe({
      next: response => {
         // console.log(response);
        // Map role names
        const mappedRoles = response.map((role: { name: string; }) => {
          if(role.name === 'ROLE_USER') {
            return {...role, name: 'User'};
          } else if(role.name === 'ROLE_MODERATOR') {
            return {...role, name: 'Moderator'};
          } else if(role.name === 'ROLE_ADMIN') {
            return {...role, name: 'Admin'};
          }
          return role;
        });
        // Assign mapped roles
        this.userRoles = mappedRoles;
        console.log(this.userRoles);
      },
      error: err => {
        this.errorMessage = err.error.message;
      }
    });
  }

  onSubmit(): void {
    const { username, email, password, role } = this.form;

    this.authService.register(username, email, password, role).subscribe({
      next: data => {
        // console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }
}

