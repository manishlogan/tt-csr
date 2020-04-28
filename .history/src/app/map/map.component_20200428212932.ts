import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import tt from '@tomtom-international/web-sdk-maps';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit {
  map = null;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.map = tt.map({
      key: 'b5w0ip0dC0PPuyZ75hbmUPBcQK7IhO0V',
      container: 'map',
      style: 'tomtom://vector/1/basic-main',
    });
    this.map.addControl(new tt.NavigationControl());
    this.map.addControl(
      new tt.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
    // this.getKitchenDetails();
    this.getSheetData().subscribe((resp) => {
      // console.log(resp);
      const features = [];
      resp.forEach((element) => {
        console.log(element);
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'point',
            coordinates: [element.longitude, element.latitude],
          },
        };
        features.push(feature);
      });
      const featureCollection = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [features],
        },
      };
      const layerName = 'kitchen';
      // if (this.map.getSource(layerName)) {
      //   this.map.getSource(layerName).setData(featureCollection);
      // } else {
      //   this.map.addSource(layerName, featureCollection);
      // }
      this.map.addSource(layerName, featureCollection);
      this.map.addLayer({
        id: 'points',
        type: 'symbol',
        source: layerName,
        layout: {
          // get the icon name from the source's 'icon' property
          // concatenate the name to get an icon from the style's sprite sheet
          'icon-image': ['concat', ['get', 'icon'], '-15'],
          // get the title name from the source's 'title' property
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top',
        },
      });
    });
  }

  public getKitchenDetails() {
    const url =
      'https://docs.google.com/spreadsheets/d/1rjxzB6Fkwu7Irz8uyXgS4OrqVMwNkdilXpxMGIjmOEo/edit?usp=sharing';
    this.http.get(url).subscribe((resp) => {
      console.log(resp);
    });
  }

  public getSheetData(): Observable<any> {
    const sheetId = '15Kndr-OcyCUAkBUcq6X3BMqKa_y2fMAXfPFLiSACiys';
    // const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/od6/public/values?alt=json`;
    const url =
      'https://spreadsheets.google.com/feeds/list/1dlbj_KA5847UGjqHxCwZ3uDGNYo2sirros7sBaBcttM/od6/public/values?alt=json';

    return this.http.get(url).pipe(
      map((res: any) => {
        const data = res.feed.entry;

        const returnArray: Array<any> = [];
        if (data && data.length > 0) {
          data.forEach((entry) => {
            const obj = {};
            for (const x in entry) {
              if (x.includes('gsx$') && entry[x].$t) {
                obj[x.split('$')[1]] = entry[x]['$t'];
              }
            }
            returnArray.push(obj);
          });
        }
        return returnArray;
      })
    );
  }
}
