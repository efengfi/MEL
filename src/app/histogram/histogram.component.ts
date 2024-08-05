import { Component, OnInit, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

interface EventData {
  date: string;
  event: string;
  frequency: number;
}

interface ParsedEventData {
  date: Date;
  event: string;
  frequency: number;
}

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.css']
})
export class HistogramComponent implements OnInit, AfterViewInit {
  private data: EventData[] = [
    { date: '2000-07-01', event: 'Event A', frequency: 10 },
    { date: '2003-07-02', event: 'Event B', frequency: 20 },
    { date: '2006-07-03', event: 'Event C', frequency: 15 },
    { date: '2009-07-04', event: 'Event D', frequency: 30 },
    { date: '2010-07-05', event: 'Event E', frequency: 25 },
    { date: '2014-07-06', event: 'Event F', frequency: 5 },
    { date: '2018-07-07', event: 'Event G', frequency: 40 },
    { date: '2019-07-08', event: 'Event H', frequency: 35 },
    { date: '2023-07-09', event: 'Event I', frequency: 10 },
  ];

  private svg: any;
  private margin = { top: 50, right: 150, bottom: 50, left: 50 };
  private width: number = 0;
  private height: number = 0;

  private colors = d3.scaleOrdinal()
    .domain(['Event A', 'Event B', 'Event C'])
    .range(['#1f77b4', '#ff7f0e', '#2ca02c']);

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.updateDimensions();
  }

  ngAfterViewInit(): void {
    this.createSvg();
    this.drawBars(this.data);
    this.addLegend();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateDimensions();
    this.redraw();
  }

  private updateDimensions(): void {
    const element = this.el.nativeElement.querySelector('.histogram-container');
    const containerWidth = element.clientWidth;
    const containerHeight = element.clientHeight;

    this.width = containerWidth - this.margin.left - this.margin.right;
    this.height = containerHeight - this.margin.top - this.margin.bottom;
  }

  private createSvg(): void {
    const element = this.el.nativeElement.querySelector('.histogram-container');
    const containerWidth = element.clientWidth;
    const containerHeight = element.clientHeight;

    this.svg = d3.select(element).append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'red');
  }

  private drawGridLines(y: d3.ScaleLinear<number, number, never>): void {
    this.svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-this.width)
        .tickFormat(() => '')
      )
      .selectAll('.tick line')
      .attr('stroke', 'white');
  }

  private drawBars(data: EventData[]): void {
    this.svg.selectAll('*').remove();

    this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', '#e8f1fa');

    // Parse the date strings into Date objects
    const parsedData: ParsedEventData[] = data.map(d => ({
      ...d,
      date: d3.timeParse('%Y-%m-%d')(d.date)!
    }));

    // Calculate the bar width based on the number of events
    const barWidth = Math.min(this.width / parsedData.length * 0.2, this.width / 20);

    const x = d3.scaleTime()
      .range([0, this.width - barWidth])
      .domain(d3.extent(parsedData, d => d.date) as [Date, Date]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(parsedData, d => d.frequency)!])
      .range([this.height, 0]);

    this.drawGridLines(y);

    const xAxis = d3.axisBottom(x).tickSize(0);
    const yAxis = d3.axisLeft(y).ticks(5).tickSize(0);

    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(xAxis)
      .selectAll('.domain, .tick line')
      .attr('stroke', 'none');

    this.svg.append('g')
      .call(yAxis)
      .selectAll('.domain, .tick line')
      .attr('stroke', 'none');

    this.svg.selectAll('rect.bar')
      .data(parsedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: ParsedEventData) => x(d.date)!)
      .attr('y', (d: ParsedEventData) => y(d.frequency))
      .attr('width', barWidth)
      .attr('height', (d: ParsedEventData) => this.height - y(d.frequency))
      .attr('fill', (d: ParsedEventData) => this.colors(d.event));

    // Change the axis lines to white
    this.svg.selectAll('.domain')
      .attr('stroke', 'white');
  }

  private addLegend(): void {
    const events = Array.from(new Set(this.data.map(d => d.event)));

    const legend = this.svg.selectAll('.legend')
      .data(events)
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (_: string, i: number) => `translate(0,${i * 20})`);

    legend.append('rect')
      .attr('x', this.width + 20)
      .attr('y', 0)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', (d: string) => this.colors(d));

    legend.append('text')
      .attr('x', this.width + 40)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text((d: string) => d);
  }

  private redraw(): void {
    d3.select(this.el.nativeElement).select('svg').remove();
    this.createSvg();
    this.drawBars(this.data);
    this.addLegend();
  }
}
