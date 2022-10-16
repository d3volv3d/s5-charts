import { Component, OnInit, AfterViewInit } from '@angular/core';

import { UuidService } from './uuid.service';

import { Subject, Observable, Subscription, fromEvent } from 'rxjs';


import * as d3 from 'd3';
import * as $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 's5-charts';

  columnData: Array<object> = [];
  column2Data: Array<object> = [];
  
  barData: Array<object> = [];
  bar2Data: Array<object> = [];

  chartData: Subject<any> = new Subject();
  chart2Data: Subject<any> = new Subject();
  chart3Data: Subject<any> = new Subject();
  chart4Data: Subject<any> = new Subject();

  showAxis: Subject<any> = new Subject();
  axisState = false;

  names = ['Hubert Blaine Wolfeschlegelsteinhausenbergerdorff Sr.', "Allysa Fusco", "Terence Godoy", "Kaylah Wise", "Isai Wingate", "Jaquelin Bair", "Dora Tolbert", "Seamus Sapp", "Jessie Maurer", "Rileigh Shearer", "Rubi Clifford", "Brynn Poston", "Michael Duncan", "Tess Fajardo", "Cailyn Dalton", "Krista Sinclair"]

  constructor(
    private uuid: UuidService
  ) { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.pushButton();
    this.showAxis.next(this.axisState);
  }

  pushButton() {
    this.genBarData();
    this.genBar2Data();
    this.genColData();
    this.genCol2Data();
  }

  toggleView() {
    this.axisState = !this.axisState;
    this.showAxis.next(this.axisState);
  }

  genColData() {
    this.columnData = [];
    for (let i = 0; i < (8 + Math.floor(Math.random() * 10)); i++) {
      this.columnData.push({ name: `${this.names[i]}`, value: Math.floor(Math.random() * 5000) });
    }
    this.chartData.next(this.columnData);
  }

  genCol2Data() {
    this.column2Data = [];
    for (let i = 0; i < (8 + Math.floor(Math.random() * 10)); i++) {
      this.column2Data.push({ name: `${this.uuid.uuid()}`, value: Math.floor(Math.random() * 10000) });
    }
    this.chart2Data.next(this.column2Data);
  }

  genBarData() {
    this.barData = [];
    for (let i = 0; i < 6; i++) {
      this.barData.push({ name: `${this.names[i]}`, value: Math.floor(Math.random() * 5000) });
    }
    this.chart3Data.next(this.barData);
  }

  genBar2Data() {
    this.bar2Data = [];
    for (let i = 0; i < 6; i++) {
      this.bar2Data.push({ name: `${this.uuid.uuid()}`, value: Math.floor(Math.random() * 10000) });
    }
    this.chart4Data.next(this.bar2Data);
  }

  // genColData() {
  //   this.barData = [];
  //   for (let i = 0; i < (8 + Math.floor(Math.random() * 10)); i++) {
  //     this.columnData.push({ name: `${this.names[i]}`, value: Math.floor(Math.random() * 5000) });
  //   }
  //   this.chart3Data.next(this.columnData);    
  // }

  // genCol2Data() {
  //   this.bar2Data = [];
  //   for (let i = 0; i < (8 + Math.floor(Math.random() * 10)); i++) {
  //     this.columnData.push({ name: `${this.names[i]}`, value: Math.floor(Math.random() * 5000) });
  //   }
  //   this.chart3Data.next(this.columnData);    
  // }

}


// @Component({
//   selector: 'app-barchart',
//   templateUrl: './barchart.component.html',
//   styleUrls: ['./barchart.component.scss']
// })
// export class BarchartComponent implements OnInit, AfterViewInit {

//   chartData: any;
//   chart: any;
//   public hash!: string;
//   public thisID!: string;

//   chartWidth = 0;
//   chartHeight = 250;

//   constructor(
//     public uuid: UuidService,
//   ) { }

//   ngOnInit(): void {
//     // this.generateData();
//   }