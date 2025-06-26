import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../auth.service";

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.css']
})
export class MapPageComponent implements OnInit, AfterViewInit {
  // @ts-ignore
  private map;
   rowData: any;

  constructor(private router: Router, public authService: AuthService) { }

  ngOnInit(): void {
    this.rowData = this.authService.getRowData();
    if (!this.authService.getRowData()) {
      this.router.navigate(['/homepage']);
    } else {
      console.log("Row data:", this.authService.getRowData());
    }
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('map').setView([22.38, 114.15], 11);
    let customIcon = L.icon({
      iconUrl: '../../assets/mark.png',
      iconSize: [38, 38],
      iconAnchor: [22, 94],
      popupAnchor: [-5, -95]
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    });
    tiles.addTo(this.map);

    this.addmarker();
  }

  addmarker(): void {

    if (!this.map) {
      console.error('Map is not initialized yet');
      return;
    }

    let customIcon = L.icon({
      iconUrl: '../../assets/mark.png',
      iconSize: [38, 38],
      iconAnchor: [22, 94],
      popupAnchor: [-5, -95]
    });

    const rowData = this.authService.getRowData();
    const latitude = rowData?.GeometryLatitude;
    const longitude = rowData?.GeometryLongitude;


    if (latitude && longitude) {
 
      L.marker([latitude, longitude], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(`
          <b>Latitude: ${latitude} <br/>
          Longitude: ${longitude} <br/>
          For more details,<br/>
          Please check wiki id: ${rowData?.ID}<br/></b>
        `);
    } else {
      console.error('Latitude and Longitude are not available');
    }
  }
}
