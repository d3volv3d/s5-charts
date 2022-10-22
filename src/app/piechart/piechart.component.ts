import { AfterViewInit, Component, OnInit, Input, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { UuidService } from '../uuid.service';

import { Subject, Observable, Subscription, fromEvent } from 'rxjs';

import * as d3 from 'd3';
import * as $ from 'jquery';

export interface Radii {
  donutInner: number;
  donutOuter: number;
  tipRadius: number;
  lineBreak: number;
  textEnd: number;
  size: number;
}

@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class PiechartComponent implements OnInit {


  radiiDefault: Radii = {
    donutInner: .6,
    donutOuter: 1,
    tipRadius: .58,
    lineBreak: .65,
    textEnd: .68,
    size: 250
  };

  subscriptions: Subscription = new Subscription();
  chartDataSub!: Subscription;
  showKeySub!: Subscription;

  @Input() pieData!: Subject<any>;
  @Input() showKey!: Subject<any>;

  public _radii = this.radiiDefault;

  get radii() { return this._radii; }
  @Input('radii') set type(value: Radii) {
    if (value) {
      this._radii = value;
    }
  }

  chartData: any;
  chart: any;
  public hash!: string;
  public thisID = '';
  public thisDot = '';
  thisTip: any;
  update = false;
  dot: any;
  keyState = false;
  keyText: any = [];

  height = 100;
  width = 100;
  g: any;

  prevData: any = [];

  color = d3.scaleOrdinal(d3.schemeCategory10);

  constructor(
    public uuid: UuidService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {}

  ngAfterViewInit() {


    this.hash = this.uuid.uuid();
    this.thisID = `chart-${this.hash}`;
    this.thisTip = `tip-${this.hash}`;
    this.thisDot = `dot-${this.hash}`;

    if (this.pieData) {
      this.chartDataSub = this.pieData.subscribe(resp => {
        this.chartData = resp;
        if (this.chart) {
          this.setChart(this.chartData);
        }
      })
    }

    if (this.showKey) {
      this.showKeySub = this.showKey.subscribe(resp => {
        this.keyState = resp;
        if (this.keyState) {
          this.openKey();
        } else {
          this.hideKey();
        }
      })
    }

    let doit;
    doit = setTimeout(() => {
      this.chart = d3.select(`#${this.thisID}`);
      this.chart
        .attr('viewBox', '0 0 ' + this._radii.size + ' ' + this._radii.size)
        // // .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('preserveAspectRatio', 'none')
        .attr('class', 'piechart');
      console.log(this.chart)

      this.setChart(this.chartData);

    });


    // Stupid develop mode can't change a value
    this.cdr.detectChanges();

  }

  drawChart(data: any) {

    this.chart.attr('width', this.width).attr('height', this.height);

    this.g = this.chart.append("g")
      .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

    const radius = (this._radii.size * this._radii.donutOuter) / 2;

    this.dot = this.g.append('circle')
      .attr('id', this.thisDot)
      .attr('fill', 'transparent');

    this.dot
      .attr('r', () => (this._radii.size * this._radii.tipRadius) / 2);

     
    this.prevData.length = 0;
    this.prevData = data;
    this.updateChart(data)

  } 

  updateChart(data: any) {
    
    const radius = (this._radii.size * this._radii.donutOuter) / 2;

    const pie = d3.pie()
      .value((d: any) => d.value)
      .sort(null)
      .padAngle(.02);

    const arc = d3.arc()
      .outerRadius(radius * this._radii.donutInner)
      .innerRadius(radius * this._radii.donutOuter)
      .cornerRadius(4);
    
    const phuqued = pie(data);

    const fatso = this.g.selectAll('path')
    .data(phuqued)
      .join(
        (enter: any) => enter.append('path')
          .on('mouseenter', (event: MouseEvent, d: any) => { this.waxOn(event, d); })
          .on('mouseleave', (event: MouseEvent, d: any) => { this.waxOff(); })
          .transition()
          .delay((d: any, i: any) => 100 * i)
          .attr('fill', (d: any, i: any) => this.color(i))
          .duration(500)
          .attrTween('d', (d: any) => {
            // this._trans = true;
            const start = { startAngle: d.startAngle, endAngle: d.startAngle };
            const i = d3.interpolate(start, d);
            return (t: any) => arc(i(t));
        }),
        (update: any) => update
          .on('mouseenter', (event: MouseEvent, d: any) => { this.waxOn(event, d); })
          .on('mouseleave', (event: MouseEvent, d: any) => { this.waxOff(); })
          .transition()
          .delay((d: any, i: any) => 100 * i)
          .attr('fill', (d: any, i: any) => this.color(i))
          // .attr('fill', 'black')
          .duration(500)
          .attrTween('d', (d: any) => {
            // this._trans = true;
            const start = { startAngle: d.startAngle, endAngle: d.startAngle };
            const i = d3.interpolate(start, d);
            return (t: any) => arc(i(t));
          })
      );

  } 

  waxOn(event: MouseEvent, d: any) {
    console.log(d);

    const tipTextBox = $(`#${this.thisTip}`);
    const tipText = `
      <h2>${d.data.value}</h2>
      <div class="tipTextSmall">${d.data.name}</div>
    `;
    tipTextBox.html(tipText);

    d3.select(`#${this.thisDot}`)
      .transition().duration(300)
        .attr('fill', this.color(d.index));

    this.g.selectAll('path')
      .transition().duration(300)
      .style('opacity', (e: any) => (d.index === e.index) ? 1 : .5);

  }

  waxOff() {
    $(`#${this.thisTip}`).empty();
    d3.select(`#${this.thisDot}`)
      .transition().duration(150)
        .attr('fill', 'transparent');

    this.g.selectAll('path')
      .transition().duration(150)
      .style('opacity', 1);
  }

  setChart(data: Array<object>) {
    const update: any = d3.select(`#${this.thisID}`).selectAll('g');
    this.update = (update._groups[0].length > 0) ? true : false;

    data.sort((a: any, b: any) => d3.descending(a.value, b.value ));
    this.setKey(data);
    console.log(data);

    this.height = this._radii.size;
    this.width = this._radii.size;

    if (this.update) {
      this.updateChart(data);
    } else {
      this.drawChart(data);
    }

  }

  setKey(data: Array<object>) {
    this.keyText = data.map((k: any, index) => {
      // console.log(k, i);
      k.color = this.color(index as unknown as string);
      return k;
    })
  }

  openKey() {
    const f = $(`#${this.thisID}`).parent().siblings('.keyState');  
    f.css('width', 'auto');
    f.css('height', 'auto');
    const fWidth = f.width();
    const fHeight = f.height();
    console.log(fWidth)
    f.width(1).height(1).animate({ width: fWidth}, 150).animate({ height: fHeight }, 300);
    // f.slideDown(300);
  }

  hideKey() {
    const f = $(`#${this.thisID}`).parent().siblings('.keyState');
    f.animate({ height: 0 }, 300).animate({ width: 0}, 150);
    // f.slideUp(300) 
  }

}
