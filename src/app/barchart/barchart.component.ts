import { AfterViewInit, Component, OnInit, Input, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { UuidService } from '../uuid.service';

import { Subject, Observable, Subscription, fromEvent } from 'rxjs';

import * as d3 from 'd3';
import * as $ from 'jquery';
// import { ViewEncapsulation } from '@angular/compiler';

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BarchartComponent implements OnInit {

  chartData: any;
  chart: any;
  public hash!: string;
  public thisID = '';
  thisTip: any;
  update = false;

  chartWidth = 0;
  chartHeight = 330;
  height = 0;
  width = 0;

  chartOpts = { 
    top: 20, 
    right: 0, 
    bottom: 0, 
    left: 20, 
    bottomBuffer: 0, 
    leftBuffer: 0,
    round: 10,
    dur: 300,
    trunc: 100,
  };


  yArray = [];
  xMin = 0;
  xMax = 1;

  yScale: any;
  xGrid: any;
  xScale: any;
  xAxis: any;
  yAxis: any;
  columns: any;
  mousePerLine: any;

  axisState = true;


  subscriptions: Subscription = new Subscription();
  chartDataSub!: Subscription;
  showAxisSub!: Subscription;

  @Input() barData!: Subject<any>;
  @Input() showAxis!: Subject<any>;

  constructor(
    public uuid: UuidService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {

    this.hash = this.uuid.uuid();
    this.thisID = `chart-${this.hash}`;
    this.thisTip = `tip-${this.hash}`;

    if (this.barData) {
      this.chartDataSub = this.barData.subscribe(resp => {
       
        this.chartData = resp;
        if (this.chart) {
          this.setChart(this.chartData);
        }
      });
    }

    if (this.showAxis) {
      this.showAxisSub = this.showAxis.subscribe(resp => {
        this.axisState = resp;
        if (!this.axisState) {
          this.chartOpts.bottom = 5;
        } else {
          this.chartOpts.bottom = 20;
        }
        
        if (this.chart) {
          // console.log(resp);
          this.setChart(this.chartData);
        }
      });
    }

    let doit;
    doit = setTimeout(() => {
      const parent = $(`#${this.thisID}`).parent();
      this.chartWidth = parent.outerWidth() as number;
      this.chart = d3.select(`#${this.thisID}`);
      
      this.chart
        .attr('viewBox', '0 0 ' + this.chartWidth + ' ' + this.chartHeight)
        // .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('preserveAspectRatio', 'none')
        .attr('class', 'barchart');

      this.setChart(this.chartData);  
    });

    


    this.subscriptions.add(this.chartDataSub);
  
    this.cdr.detectChanges();

    // this.drawChart
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  drawChart(data: Array<object>) {

    const shim = (this.yScale.step() - this.yScale.bandwidth()) / 2;

    this.chart.append('g')
      .attr('class', 'grid gridNoNum')
      .attr('id', `grid__x-${this.hash}`)
      .attr('transform', `translate(${this.chartOpts.left},${this.chartOpts.top})`)
      .call(this.xGrid);

    this.chart.append('g')
      .attr('class', 'axis axis--y')
      .attr('id', `axis__y-${this.hash}`)
      .attr('transform', `translate(${this.chartOpts.left},${this.chartOpts.top + this.yScale.step() - this.yScale.bandwidth() + shim} )`)
      .attr('opacity', () => {
        return (!this.axisState) ? 0 : 1;
      })
      .call(this.yAxis)

    this.chart.append('g')
      .attr('class', 'axis axis--x')
      .attr('id', `axis__x-${this.hash}`)
      .attr('transform', `translate(${this.chartOpts.left},${this.chartOpts.top})`)
      // .attr('opacity', () => {
      //   return (!this.axisState) ? 0 : 1;
      // })
      .call(this.xAxis);

    this.columns = this.chart.append('g')
      .attr('class', `columns columns-${this.hash}`)
      .attr('transform', `translate(${this.chartOpts.left},${this.chartOpts.top})`)

    this.columns.selectAll(`.column-${this.hash}`)
      .data(this.chartData)
      .enter().append('rect')
      .attr('class', `column-${this.hash}`)
      .attr('x', 0)
      .attr('width', (d: any) => this.xScale(d.value))
      .attr('height', this.yScale.bandwidth())
      .attr('y', (d: any) => this.yScale(d.name))
      .attr('fill-opacity', .25)
      .attr('rx', (d: any) => {
        return this.chartOpts.round;
        // const num = (this.yScale(d.value) < this.chartOpts.round) ? this.yScale(d.value) : this.chartOpts.round;
        // const num = (this.yScale(d.value) < this.chartOpts.round) ? this.yScale(d.value) : this.chartOpts.round;
        // return num;
      })
      .attr('ry', this.chartOpts.round)
      .on('mouseover', ((event: MouseEvent, d: any) => {
        this.waxOn(event, d);
      }))
      .on('mouseleave',((event: MouseEvent, d: any) => {
        this.waxOff(event, d);
      }));

    console.log(this.yScale.step(), this.yScale.bandwidth(), this.yScale.step() - this.yScale.bandwidth())


    // this.mousePerLine = this.chart.append('g')
    //   .style('visibility', 'hidden')
    //   .attr('class', 'mouse-per-line');
  
    // this.mousePerLine.append('line') // create vertical line to follow mouse
    //   .attr('class', 'mouse-line-back hover-line')
    //   .attr('id', `mouse-line-back-${this.hash}`)
    //   .attr('y1', (0 + this.chartOpts.top))
    //   .attr('y2', this.height);

    // this.mousePerLine.append('line') // create vertical line to follow mouse
    //   .attr('class', 'mouse-line hover-line')
    //   .attr('id', `mouse-line-${this.hash}`)
    //   .attr('y1', (0 + this.chartOpts.top))
    //   .attr('y2', this.height);




  }

  updateChart(data: Array<object>) {

    const shim = (this.yScale.step() - this.yScale.bandwidth()) / 2;
    
    this.chart.select(`#grid__x-${this.hash}`)
      .transition().duration(this.chartOpts.dur)
      .attr('transform', `translate(${this.chartOpts.left},${this.chartOpts.top})`)
      .call(this.xGrid);

    this.chart.select(`#axis__y-${this.hash}`)
      .transition().duration(this.chartOpts.dur)
      .attr('transform', `translate(${this.chartOpts.left},${this.chartOpts.top + this.yScale.step() - this.yScale.bandwidth() + shim} )`)
      .attr('opacity', () => {
        return (!this.axisState) ? 0 : 1;
      })
      .call(this.yAxis);

    this.chart.select(`#axis__x-${this.hash}`)
      .transition().duration(this.chartOpts.dur)
      .attr('transform', `translate(${this.chartOpts.left},${this.chartOpts.top})`)
      // .attr('opacity', () => {
      //   return (!this.axisState) ? 0 : 1;
      // })
      .call(this.xAxis);

    const fatso = this.columns.selectAll(`.column-${this.hash}`)
      .data(this.chartData)
      .join(
        (enter: any) => enter.append('rect')
          .attr('class', `column-${this.hash}`)
          .attr('x', 0)
          .attr('width', (d: any) => this.xScale(d.value))
          .attr('height', (d: any) => {
            return (!this.axisState) ? this.yScale.step() / 2 : this.yScale.bandwidth();
          })
          .attr('y', (d: any) => this.yScale(d.name))
          .attr('fill-opacity', .25)
          .attr('rx', (d: any) => {
            return this.chartOpts.round;
            // const num = (this.yScale(d.value) < this.chartOpts.round) ? this.yScale(d.value) : this.chartOpts.round;
            // const num = (this.yScale(d.value) < this.chartOpts.round) ? this.yScale(d.value) : this.chartOpts.round;
            // return num;
          })
          .attr('ry', this.chartOpts.round)
          .on('mouseover', ((event: MouseEvent, d: any) => {
            this.waxOn(event, d);
          }))
          .on('mouseleave',((event: MouseEvent, d: any) => {
            this.waxOff(event, d);
          })),
        (update: any) => update
          .transition().duration(this.chartOpts.dur)
            .attr('x', 0)
            .attr('width', (d: any) => this.xScale(d.value))
            .attr('height', (d: any) => {
              console.log(this.yScale.step(), this.yScale.bandwidth())
              return (this.axisState) ? this.yScale.step() / 2 : this.yScale.bandwidth();
            })
            .attr('y', (d: any) => this.yScale(d.name))
      );
  }

  waxOn(event:any, d: any) {
    const _this = d3.select(event.target);
    _this.transition().duration(this.chartOpts.dur).attr('fill-opacity', .75);

    // this.mousePerLine
    // .attr('transform', 'translate(' + (this.xScale(d.name) + (this.xScale.bandwidth() / 2) + this.chartOpts.left) + ',0)')
    // .style('visibility', 'visible');

    this.justTheTip(event, d)
  }

  waxOff(event: any, d: any) {
    const _this = d3.select(event.target);
    _this.transition().duration(100).attr('fill-opacity', .25);
    // this.mousePerLine.style('visibility', 'hidden');
    $('#' + this.thisTip).css({ visibility: 'hidden' });
  }

  justTheTip(event: any, d: any) {
    const toolTipText = ``;

    let toolTipTextItems = `
      <table class="w-100">
        <tr><td>${d.name}:</td><td>${d.value}</td></tr>
      </table>`;


    // $('#' + this.thisTip + ' #toolTipText').html(toolTipText);
    $('#' + this.thisTip + ' #toolTipTextItems').html(toolTipTextItems);

    // const target = $('.mouse-line')[0].getBoundingClientRect();
    // const target = $(`#mouse-line-${this.hash}`)[0].getBoundingClientRect();
    const target = $(event.target)[0].getBoundingClientRect();

    const cxBox = $('#' + this.thisID)[0].getBoundingClientRect();
    // const point = $(target)[0].getBoundingClientRect();
    const wTip = $('#' + this.thisTip).outerWidth();
    const hTip = $('#' + this.thisTip).outerHeight()
    ;
    const heightTip = (hTip) ? hTip : 100;
    const widthTip = (wTip) ? wTip : 100;
    let windowWidth = 1000;
    const fuckYou = $(window).width();
    if (fuckYou) { windowWidth = fuckYou; }

    let posTipY = 0;
    let posTipX = 0;

    let tipLeft: any = 'auto';
    let tipRight: any = 'auto';
    let klass = 'tooltipLeft';


    if (target.left < (windowWidth / 2)) {
      tipLeft = target.left - cxBox.left + (Math.floor( target.width) / 2) + 12;
    } else {
      tipLeft = target.left - cxBox.left + (Math.floor( target.width) / 2) - widthTip - 12;
      klass = 'tooltipRight';
    }

    posTipY = target.top - cxBox.top - heightTip - 12;
    // posTipY = target.top - cxBox.top;



    $('#' + this.thisTip).css({ left: tipLeft, right: tipRight, top: posTipY });

    $('#' + this.thisTip).removeClass('tipBottom tooltipLeft tooltipRight').addClass(klass);

    // const yCheck = $('#' + this.thisTip)[0].getBoundingClientRect().top;

    // // Oops. Now that these tips are potentially Faulkner text, let's make sure they stay on the page.
    // if (yCheck < 100) {
    //   const bar = target.bottom - cxBox.top + 12;
    //   $('#' + this.thisTip).css({ top: bar }).addClass('tipBottom');
    //   $('#' + this.thisTip);
    // }

    $(`#${this.thisTip}`).css({ top: posTipY });


    $('#' + this.thisTip).css({ visibility: 'visible' });

  }

  setChart(data: Array<object>) {

    // data.sort((a: any,b: any) => b.value - a.value);

    // this.yMin = d3.min(data, (d: any) => d.value);
    this.xMax = d3.max(data, (d: any) => d.value);
    this.yArray = data.map((d: any) => d.name) as any;

    const update: any = d3.select(`#${this.thisID}`).selectAll('g');
    this.update = (update._groups[0].length > 0) ? true : false;

    this.height = this.chartHeight - this.chartOpts.bottom - this.chartOpts.top;
    this.width = this.chartWidth - this.chartOpts.left - this.chartOpts.right;

    this.xScale = d3.scaleLinear()
      .range([0, this.width])
      .domain([0, this.xMax])
      .nice();

    this.xGrid = d3.axisTop(this.xScale)
      // tickFormat((v: any) => )
      .tickSize(-this.height)
      .ticks(4);

    this.xAxis = d3.axisTop(this.xScale)
      .tickSize(0)
      //.tickValues(this.xScale.ticks( 2 ).concat( this.xScale.domain()))
      .ticks(1, 's')
      .tickValues(this.xScale.domain())
      // .tickFormat(((d: any) => 

      // ))
      // .ticks(1, 's');

    this.yScale = d3.scaleBand()
      .domain(this.yArray)
      .range([0,this.height])
      .padding(0.2);

    this.yAxis = d3.axisRight(this.yScale)
      .tickFormat((v: any) => {
        const length = this.chartOpts.trunc;
        let string = v;

        string = (string.length > length) ? `${string.substring(0,length - 1)}...` : v;
        return string;

      })
      .tickSize(0)
      .tickSizeOuter(0)
      // .tickSize(0)
      // .tickSizeOuter(2)
      // .ticks(4);


    if (this.update) {
      this.updateChart(data);
    } else {
      this.drawChart(data);
    }
    
  }

}

