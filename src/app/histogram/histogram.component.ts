import { Component, OnInit, ElementRef, HostListener, AfterViewInit, ViewChild } from '@angular/core';
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
  @ViewChild('startDate') startDateInput: any;
  @ViewChild('endDate') endDateInput: any;

  private data: EventData[] = [
    { date: '2019-11-20', event: 'Branch Visit', frequency: 1 },
    { date: '2020-10-23', event: 'Branch Visit', frequency: 1 },
    { date: '2020-11-03', event: 'Branch Visit', frequency: 1 },
    { date: '2016-08-01', event: 'Saving Open', frequency: 1 },
    { date: '2017-01-03', event: 'Checking Open', frequency: 1 },
    { date: '2017-03-03', event: 'Checking Dormant', frequency: 1 },
    { date: '2017-08-15', event: 'Consumer Loan Open', frequency: 1 },
    { date: '2018-05-25', event: 'Consumer Loan Close', frequency: 1 },
    { date: '2018-08-26', event: 'Consumer Loan Open', frequency: 1 },
    { date: '2019-10-25', event: 'Consumer Loan Close', frequency: 1 },
    { date: '2018-09-09', event: 'Consumer Loan Open', frequency: 1 },
    { date: '2019-10-26', event: 'Consumer Loan Close', frequency: 1 },
    { date: '2020-01-07', event: 'Consumer Loan Open', frequency: 1 },
    { date: '2020-12-09', event: 'Consumer Loan Paid Off', frequency: 1 },
    { date: '2021-06-09', event: 'Consumer Loan Open', frequency: 1 },
    { date: '2021-06-09', event: 'Consumer Loan Close', frequency: 1 },
    { date: '2024-01-09', event: 'Consumer Loan Open', frequency: 1 },
    { date: '2024-04-13', event: 'Consumer Loan Close', frequency: 1 },
    { date: '2024-05-03', event: 'Consumer Loan Open', frequency: 1 },
    { date: '2017-09-09', event: 'Auto Loan Open', frequency: 1 },
    { date: '2018-01-09', event: 'Auto Loan Close', frequency: 1 },
    { date: '2018-02-17', event: 'Auto Loan Open', frequency: 1 },
    { date: '2024-01-05', event: 'Auto Loan Close', frequency: 1 },
    { date: '2021-06-09', event: 'Auto Loan Open', frequency: 1 },
    { date: '2017-11-26', event: 'Credit Open', frequency: 1 },
    { date: '2018-08-08', event: 'Credit Change', frequency: 1 },
    { date: '2021-09-16', event: 'Credit Freeze', frequency: 1 },
    { date: '2024-03-15', event: 'Credit Incomplete Application', frequency: 1 },
    { date: '2024-05-05', event: 'Credit Incomplete Application', frequency: 1 },
    { date: '2024-05-05', event: 'Credit Complete Application', frequency: 1 },
    { date: '2024-05-06', event: 'Credit Open', frequency: 1 },
    { date: '2021-11-05', event: 'Debit Freeze', frequency: 1 },
    { date: '2021-09-16', event: 'eGain COVID', frequency: 1 },
    { date: '2021-09-18', event: 'eGain COVID', frequency: 1 },
    { date: '2023-01-09', event: 'eGain Social Engineering', frequency: 1 },
    { date: '2022-02-02', event: 'eMessages Email Member', frequency: 1 },
    { date: '2022-02-02', event: 'Mobile Wallet Wallet', frequency: 1 },
    { date: '2024-03-14', event: 'Personal Loan Complete Application', frequency: 1 }
  ];

  private filteredData: EventData[] = this.data;

  private svg: any;
  private margin = { top: 30, right: 275, bottom: 50, left: 15 };
  private width: number = 0;
  private height: number = 0;

  private colors = d3.scaleOrdinal()
    .domain(['Open', 'Dormant', 'Close', 'Change', 'Paid Off', 'Freeze', 'Incomplete Application', 'Complete Application', 'Visit', 'COVID', 'Social Engineering', 'Email Member', 'Wallet'])
    .range(['#24bb74', '#fed500', '#d30d4b', '#fa8c0f', '#1e95ef', '#e8f1fa', '#fed500', '#24bb74', '#6a46fe', '#600622', '#7b6a00', '#c8f8e2', '#4d2b05']);

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.updateDimensions();
  }

  ngAfterViewInit(): void {
    this.createSvg();
    this.drawBars(this.filteredData);
    this.addLegend();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateDimensions();
    this.redraw();
  }

  private updateDimensions(): void {
    const element = this.el.nativeElement.querySelector('.histogram');
    const containerWidth = element.clientWidth;
    const containerHeight = element.clientHeight;

    this.width = containerWidth - this.margin.left - this.margin.right;
    this.height = containerHeight - this.margin.top - this.margin.bottom;
  }

  private createSvg(): void {
    const element = this.el.nativeElement.querySelector('.histogram');
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
        .ticks(d3.max(y.domain()) || 1)  // Ensure ticks are set based on max frequency
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
  
    const parsedData: ParsedEventData[] = data.map(d => ({
      ...d,
      date: d3.timeParse('%Y-%m-%d')(d.date)!
    }));
  
    const barWidth = Math.min(this.width / parsedData.length * 0.3, this.width / 20);
  
    const x = d3.scaleTime()
      .range([0, this.width - barWidth])
      .domain(d3.extent(parsedData, d => d.date) as [Date, Date]);
  
    const maxFrequency = Math.ceil(d3.max(parsedData, d => d.frequency)! / 5) * 5;
  
    const y = d3.scaleLinear()
      .domain([0, maxFrequency])
      .range([this.height, 0]);
  
    this.drawGridLines(y);
  
    const xAxis = d3.axisBottom(x)
      .ticks(d3.timeYear.every(1));
  
    const yAxis = d3.axisLeft(y)
      .ticks(maxFrequency)  // Set tick interval to 1
      .tickSize(0);
  
    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(xAxis)
      .selectAll('.domain, .tick line, .tick text')
      .attr('stroke', 'none')
      .style('font-family', 'sans-serif')
      .style('font-size', '12px');
  
    this.svg.append('g')
      .call(yAxis)
      .selectAll('.domain, .tick line, .tick text')
      .attr('stroke', 'none')
      .style('font-family', 'sans-serif')
      .style('font-size', '12px');
  
    this.svg.selectAll('rect.bar')
      .data(parsedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: ParsedEventData) => x(d.date)!)
      .attr('y', (d: ParsedEventData) => y(d.frequency))
      .attr('width', barWidth)
      .attr('height', (d: ParsedEventData) => this.height - y(d.frequency))
      .attr('fill', (d: ParsedEventData) => this.getEventColor(d.event))
      .attr('stroke', (d: ParsedEventData) => d3.color(this.getEventColor(d.event))!.darker(1).toString())
      .attr('stroke-width', 1);
  
    this.svg.selectAll('.domain')
      .attr('stroke', 'white');
  }
  

  private getEventColor(event: string): string {
    if (event.toLowerCase().includes('open')) {
      return '#24bb74'; // Open
    } else if (event.toLowerCase().includes('dormant')) {
      return '#fed500'; // Dormant
    } else if (event.toLowerCase().includes('close')) {
      return '#d30d4b'; // Close
    } else if (event.toLowerCase().includes('change')) {
      return '#fa8c0f'; // Change
    } else if (event.toLowerCase().includes('paid off')) {
      return '#1e95ef'; // Paid Off
    } else if (event.toLowerCase().includes('freeze')) {
      return '#e8f1fa'; // Freeze
    } else if (event.toLowerCase().includes('incomplete application')) {
      return '#fed500'; // Incomplete Application
    } else if (event.toLowerCase().includes('complete application')) {
      return '#24bb74'; // Complete Application
    } else if (event.toLowerCase().includes('visit')) {
      return '#6a46fe'; // Visit
    } else if (event.toLowerCase().includes('covid')) {
      return '#600622'; // COVID
    } else if (event.toLowerCase().includes('social engineering')) {
      return '#7b6a00'; // Social Engineering
    } else if (event.toLowerCase().includes('email member')) {
      return '#c8f8e2'; // Email Member
    } else if (event.toLowerCase().includes('wallet')) {
      return '#4d2b05'; // Wallet
    } else {
      return '#000000'; // Default color if none match
    }
  }

  private addLegend(): void {
    const events = Array.from(new Set(this.data.map(d => d.event)));
  
    const legend = this.svg.selectAll('.legend')
      .data(events)
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (_: string, i: number) => `translate(0,${i * 20})`);
  
    legend.append('circle')  // Change rect to circle
      .attr('cx', this.width + 29)  // Adjust x position
      .attr('cy', 9)  // Adjust y position
      .attr('r', 3)  // Set radius for the circle
      .style('fill', (d: string) => this.getEventColor(d));
  
    legend.append('text')
      .attr('x', this.width + 40)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text((d: string) => d)
      .style('font-family', 'sans-serif')
      .style('font-size', '12px');
  }

  private redraw(): void {
    d3.select(this.el.nativeElement).select('svg').remove();
    this.createSvg();
    this.drawBars(this.filteredData);
    this.addLegend();
  }

  applyFilters(): void {
    const startDateValue = this.startDateInput.nativeElement.value;
    const endDateValue = this.endDateInput.nativeElement.value;
  
    if (startDateValue && endDateValue) {
      const startDate = new Date(startDateValue);
      const endDate = new Date(endDateValue);
  
      this.filteredData = this.data.filter(d => {
        const date = new Date(d.date);
        return date >= startDate && date <= endDate;
      });
    } else if (startDateValue) {
      const startDate = new Date(startDateValue);
  
      this.filteredData = this.data.filter(d => {
        const date = new Date(d.date);
        return date >= startDate;
      });
    } else if (endDateValue) {
      const endDate = new Date(endDateValue);
  
      this.filteredData = this.data.filter(d => {
        const date = new Date(d.date);
        return date <= endDate;
      });
    } else {
      // If both date inputs are empty, reset to the original data
      this.filteredData = this.data;
    }
  
    this.redraw();
  }
}
