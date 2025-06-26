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
  isAddDialogOpen = false;
  isEditDialogOpen = false;
  isDeleteConfirmOpen = false;
  editRowData: any = null;
  addRowData: any = null;
  deleteRowData: any = null;

  // geo 資料表所有欄位
  geoFields = [
    { key: 'id', label: 'ID' },
    { key: 'NAME_OF_DISTRICT_COUNCIL_DISTRICT_EN', label: 'DISTRICT(EN)' },
    { key: 'LOCATION_EN', label: 'LOCATION(EN)' },
    { key: 'ADDRESS_EN', label: 'ADDRESS(EN)' },
    { key: 'NAME_OF_DISTRICT_COUNCIL_DISTRICT_TC', label: 'DISTRICT(TC)' },
    { key: 'LOCATION_TC', label: 'LOCATION(TC)' },
    { key: 'ADDRESS_TC', label: 'ADDRESS(TC)' },
    { key: 'NAME_OF_DISTRICT_COUNCIL_DISTRICT_SC', label: 'DISTRICT(SC)' },
    { key: 'LOCATION_SC', label: 'LOCATION(SC)' },
    { key: 'ADDRESS_SC', label: 'ADDRESS(SC)' },
    { key: 'STANDARD_BS1363_no', label: 'STANDARD_BS1363_no' },
    { key: 'MEDIUM_IEC62196_no', label: 'MEDIUM_IEC62196_no' },
    { key: 'MEDIUM_SAEJ1772_no', label: 'MEDIUM_SAEJ1772_no' },
    { key: 'MEDIUM_OTHERS_no', label: 'MEDIUM_OTHERS_no' },
    { key: 'QUICK_CHAdeMO_no', label: 'QUICK_CHAdeMO_no' },
    { key: 'QUICK_CCS_DC_COMBO_no', label: 'QUICK_CCS_DC_COMBO_no' },
    { key: 'QUICK_IEC62196_no', label: 'QUICK_IEC62196_no' },
    { key: 'QUICK_GB_T20234_3_DC__no', label: 'QUICK_GB_T20234_3_DC__no' },
    { key: 'QUICK_OTHERS_no', label: 'QUICK_OTHERS_no' },
    { key: 'REMARK_FOR__OTHERS_', label: 'REMARK_FOR__OTHERS_' },
    { key: 'DATA_PATH', label: 'DATA_PATH' },
    { key: 'GeometryLongitude', label: 'GeometryLongitude' },
    { key: 'GeometryLatitude', label: 'GeometryLatitude' }
  ];

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

  openAddDialog() {
    this.addRowData = {};
    this.isAddDialogOpen = true;
  }

  openEditDialog(row: any) {
    this.editRowData = { ...row };
    this.isEditDialogOpen = true;
  }

  confirmDelete(row: any) {
    this.deleteRowData = row;
    this.isDeleteConfirmOpen = true;
  }

  submitAdd() {
    this.authService.createGeo(this.addRowData).subscribe(
      (res) => {
        alert('新增成功');
        this.isAddDialogOpen = false;
        this.search(); // 重新查詢刷新資料
      },
      (err) => {
        alert('新增失敗');
      }
    );
  }

  submitEdit() {
    this.authService.updateGeo(this.editRowData.id, this.editRowData).subscribe(
      (res) => {
        alert('編輯成功');
        this.isEditDialogOpen = false;
        this.search();
      },
      (err) => {
        alert('編輯失敗');
      }
    );
  }

  submitDelete() {
    this.authService.deleteGeo(this.deleteRowData.id).subscribe(
      (res) => {
        alert('刪除成功');
        this.isDeleteConfirmOpen = false;
        this.search();
      },
      (err) => {
        alert('刪除失敗');
      }
    );
  }

  closeDialog() {
    this.isAddDialogOpen = false;
    this.isEditDialogOpen = false;
  }
}
