import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  isAuthDialogOpen = false;
  filters: any[] = [];
  isLoading: boolean = false;
  username: string = '';
  password: string = '';
  currentUser: any;

  constructor(private authService: AuthService,private router: Router) {
  }

  ngOnInit(): void {
    this.fetchUniqueValues();
    this.getcurrentUser();
  }

  fetchUniqueValues(): void {
    this.isLoading = true;
    this.authService.getUniqueValues().subscribe(
      (data) => {
        this.isLoading = false;
        this.processFiltersData(data);
      },
      (error) => {
        this.isLoading = false;
        console.error('Data loading failed!');
      }
    );
  }

  getcurrentUser(): void {
    this.currentUser = this.authService.getUsername();
  }

  processFiltersData(data: any): void {
    this.filters = [
      {name: 'NAME_OF_DISTRICT_COUNCIL_DISTRICT_EN', options: data.districts, label: 'DISTRICT'},
      {name: 'LOCATION_EN', options: data.locations, label: 'LOCATION'},
      {name: 'LOCATION_TC', options: data.places, label: 'PLACE'}
    ];
  }

  data: any[] = [];

  openAuthDialog() {
    this.isAuthDialogOpen = true;
  }

  closeAuthDialog() {
    this.isAuthDialogOpen = false;
  }

  selectedDistrict: string = '';
  selectedLocation: string = '';
  selectedPlace: string = '';


  search(): void {

      const searchParams = {
        district: this.selectedDistrict,
        location: this.selectedLocation,
        place: this.selectedPlace
      };
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      console.log("Sending search request with parameters:", searchParams);
      this.authService.searchData(searchParams, headers).subscribe(
        (data) => {

          if (data && data.length > 1000) {
            this.data = data.slice(0, 1000); 
          } else {
            this.data = data;
          }
          console.log("Received data from server:", data);
        },
        (error) => {
          this.isLoading = false;
          console.error("Search request failed:");
        }
      );
  }





  submit() {
    const credentials = {usr: this.username, pwd: this.password};
    this.authService.authenticate(credentials).subscribe(
      (response) => {
        if (response.success) {
          this.isAuthDialogOpen = false;
          this.currentUser = this.username;
          this.authService.setUsername(this.username);
          alert(response.message);
          console.log(response.message, 1)
        } else {

          alert(response.message);
          console.log(response.message, 2)

        }
      },
      (error) => {

        console.error('An error occurred during the request');
      }
    );
  }

  goToSelf() {
    this.router.navigate(['/self']);
  }


  deleteRow(row: any): void {
    const rowId = row.id;
    console.log("Deleting row with ID:", rowId);

    this.authService.deleteData(rowId).subscribe(
      (response) => {
        if (response.success) {

          this.data = this.data.filter(item => item.id !== rowId);
          console.log("Row deleted successfully.");
        } else {
          console.error("Failed to delete row:", response.message);
        }
      },
      (error) => {
        console.error("Error deleting row:", error);
        alert("Something went wrong while deleting the row.");
      }
    );
  }

  viewDetails(row: any) {
    this.authService.setRowData(row);
    this.router.navigate(['/map']);
  }
}
