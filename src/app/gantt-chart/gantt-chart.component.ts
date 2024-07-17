import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import * as d3 from 'd3';

interface Event {
  name: string;
  start: Date;
  end: Date;
}

interface Task {
  task: string;
  events: Event[];
  expanded: boolean;
}

@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.css']
})
export class GanttChartComponent implements OnInit, AfterViewInit {
  @ViewChild('taskFilter') taskFilter!: ElementRef;
  @ViewChild('startDate') startDate!: ElementRef;
  @ViewChild('endDate') endDate!: ElementRef;
  @ViewChild('memberIdFilter') memberIdFilter!: ElementRef;

  memberData: { [memberId: string]: Task[] } = {
    '001': [
      { task: 'Checking', events: [
        { name: 'Event 1', start: new Date(2024, 5, 1), end: new Date(2024, 5, 3) },
        { name: 'Event 2', start: new Date(2024, 5, 4), end: new Date(2024, 5, 5) },
        { name: 'Event 3', start: new Date(2024, 5, 10), end: new Date(2024, 7, 11) }
      ], expanded: true },
      { task: 'Savings', events: [
        { name: 'Event 1', start: new Date(2024, 2, 3), end: new Date(2024, 5, 5) },
        { name: 'Event 2', start: new Date(2024, 9, 6), end: new Date(2024, 11, 20) },
        { name: 'Event 3', start: new Date(2024, 3, 15), end: new Date(2024, 4, 18) }
      ], expanded: true },
      { task: 'Loan', events: [
        { name: 'Event 1', start: new Date(2024, 7, 9), end: new Date(2024, 8, 10) },
        { name: 'Event 2', start: new Date(2024, 2, 13), end: new Date(2024, 3, 15) },
        { name: 'Event 3', start: new Date(2024, 5, 20), end: new Date(2024, 7, 22) }
      ], expanded: true },
      { task: 'Credit', events: [
        { name: 'Event 1', start: new Date(2024, 7, 9), end: new Date(2024, 8, 5) },
        { name: 'Event 2', start: new Date(2024, 2, 13), end: new Date(2024, 3, 15) },
        { name: 'Event 3', start: new Date(2024, 5, 20), end: new Date(2024, 7, 22) }
      ], expanded: true },
    ],
    '002': [
      { task: 'Credit', events: [
        { name: 'Event 1', start: new Date(2024, 5, 6), end: new Date(2024, 5, 8) },
        { name: 'Event 2', start: new Date(2024, 5, 9), end: new Date(2024, 5, 12) },
        { name: 'Event 3', start: new Date(2024, 5, 14), end: new Date(2024, 5, 16) }
      ], expanded: true }
    ],
    '003': [
      { task: 'Loan', events: [
        { name: 'Event 1', start: new Date(2024, 5, 9), end: new Date(2024, 5, 12) },
        { name: 'Event 2', start: new Date(2024, 5, 13), end: new Date(2024, 5, 15) },
        { name: 'Event 3', start: new Date(2024, 5, 20), end: new Date(2024, 5, 22) }
      ], expanded: true }
    ]
  };

  uniqueTasks = ['Checking', 'Savings', 'Credit', 'Loan'];
  sampleMemberIds = Object.keys(this.memberData);
  svgWidth: number = 800;
  zoom: any;
  svgHeight: any;
  dateRangeText: string = '';

  constructor() {}

  ngOnInit(): void {
    this.calculateSvgWidth();
    this.updateDateRangeText();
  }
  
  ngAfterViewInit(): void {
    this.calculateSvgWidth();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.calculateSvgWidth();
  }

  calculateSvgWidth(): void {
    const containerWidth = document.querySelector('.gantt-chart')?.clientWidth || 800;
    const padding = 20;
    this.svgWidth = containerWidth - padding;
    this.drawGanttChart();
  }

  drawGanttChart(): void {
    d3.select('svg').selectAll('*').remove();
  
    const filteredTasks = this.filterTasks();
    const margin = { top: 30, right: 0, bottom: 48, left: 161 };
    const width = this.svgWidth - margin.left - margin.right;
    const height = 451 - margin.top - margin.bottom;
  
    const svg = d3.select('svg')
      .attr('width', this.svgWidth)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('class', 'chart-container')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'white');
  
    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);
  
    svg.append('defs').append('clipPath')
      .attr('id', 'clip-x-axis')
      .append('rect')
      .attr('width', width)
      .attr('height', margin.top)
      .attr('x', 0)
      .attr('y', -margin.top);
  
    const color = d3.scaleOrdinal<string>()
      .domain(['Checking', 'Savings', 'Credit', 'Loan'])
      .range(['#7b61ff', '#ff7f0e', '#fbc949', '#31debd']);
  
    const minDate = d3.min(filteredTasks.flatMap(task => task.events), e => e.start)!;
    const maxDate = d3.max(filteredTasks.flatMap(task => task.events), e => e.end)!;
  
    const x = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);
  
    const y = d3.scaleBand()
      .domain(filteredTasks.flatMap(task => [task.task, ...(task.expanded ? task.events.map(event => `${task.task} - ${event.name}`) : [])]))
      .range([0, height])
      .paddingInner(0.35)
      .paddingOuter(0.35);
  
    const chartContainer = svg.append('g')
      .attr('class', 'chart-content')
      .attr('clip-path', 'url(#clip)');
  
    chartContainer.selectAll('.grid-line')
      .data(filteredTasks.flatMap(task => task.events))
      .enter().append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => x(d.start))
      .attr('x2', d => x(d.start))
      .attr('y1', 0)
      .attr('y2', height)
      .style('stroke', '#ccc')
      .style('stroke-dasharray', '2,2');
  
    chartContainer.selectAll('.span-bar')
      .data(filteredTasks)
      .enter().append('rect')
      .attr('class', 'span-bar')
      .attr('x', d => x(d3.min(d.events, e => e.start)!))
      .attr('y', d => y(d.task)! + y.bandwidth() * 0.25) // Adjust the y position to make the span bar skinnier
      .attr('width', d => x(d3.max(d.events, e => e.end)!) - x(d3.min(d.events, e => e.start)!))
      .attr('height', y.bandwidth() * 0.5) // Adjust the height to make the span bar skinnier
      .attr('fill', d => d3.color(color(d.task))!.darker(0.0).toString())
      .attr('rx', 5)
      .attr('ry', 5)
      .on('mouseover', function (event, d) {
        const tooltip = d3.select('.tooltip');
        const minStart = d3.min(d.events, e => e.start)!;
        const maxEnd = d3.max(d.events, e => e.end)!;
        const duration = Math.ceil((maxEnd.getTime() - minStart.getTime()) / (1000 * 60 * 60 * 24));
        tooltip.transition().duration(200).style('opacity', .9);
        const tooltipContent = `
          <div style="text-align: left; padding: 8px 10px 8px 0px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right; min-width: 60px; padding-right: 8px;">Product:</div>
              <div style="text-align: left; flex: 1;">${d.task}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right; min-width: 60px; padding-right: 8px;">Start:</div>
              <div style="text-align: left; flex: 1;">${minStart.toLocaleDateString()}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right; min-width: 60px; padding-right: 8px;">End:</div>
              <div style="text-align: left; flex: 1;">${maxEnd ? maxEnd.toLocaleDateString() : 'Ongoing'}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right; min-width: 60px; padding-right: 8px;">Duration:</div>
              <div style="text-align: left; flex: 1;">${duration} days</div>
            </div>
          </div>
        `;
        tooltip.html(tooltipContent)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px')
          .style('max-width', '250px')
          .style('pointer-events', 'none');
      })
      .on('mousemove', function (event, d) {
        const tooltip = d3.select('.tooltip');
        const { pageX, pageY } = event;
        const tooltipWidth = parseInt(tooltip.style('width'), 10);
        const tooltipHeight = parseInt(tooltip.style('height'), 10);
  
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
  
        let left = pageX + 5;
        let top = pageY - 28;
  
        if (pageX + tooltipWidth + 20 > viewportWidth) {
          left = pageX - tooltipWidth - 10;
        }
  
        if (pageY + tooltipHeight + 20 > viewportHeight) {
          top = pageY - tooltipHeight - 10;
        }
  
        tooltip.style('left', left + 'px').style('top', top + 'px');
      })
      .on('mouseout', function () {
        const tooltip = d3.select('.tooltip');
        tooltip.transition().duration(500).style('opacity', 0);
      });
  
    chartContainer.selectAll('.bar')
      .data(filteredTasks.flatMap(task => task.expanded ? task.events.map(event => ({ task: task.task, ...event })) : []))
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.start))
      .attr('y', d => y(`${d.task} - ${d.name}`)!)
      .attr('width', d => x(d.end) - x(d.start))
      .attr('height', y.bandwidth())
      .attr('fill', d => color(d.task))
      .attr('fill-opacity', 0.3)
      .attr('stroke', d => d3.color(color(d.task))!.darker(1).toString())
      .attr('stroke-width', 1)
      .attr('rx', 5)
      .attr('ry', 5)
      .on('mouseover', function (event, d) {
        const tooltip = d3.select('.tooltip');
        const minStart = d.start;
        const maxEnd = d.end;
        const duration = Math.ceil((maxEnd.getTime() - minStart.getTime()) / (1000 * 60 * 60 * 24));
        tooltip.transition().duration(200).style('opacity', .9);
        const tooltipContent = `
          <div style="text-align: left; padding: 8px 10px 8px 0px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right; min-width: 60px; padding-right: 8px;">Event:</div>
              <div style="text-align: left; flex: 1;">${d.name}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right; min-width: 60px; padding-right: 8px;">Product:</div>
              <div style="text-align: left; flex: 1;">${d.task}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right; min-width: 60px; padding-right: 8px;">Start:</div>
              <div style="text-align: left; flex: 1;">${minStart.toLocaleDateString()}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right; min-width: 60px; padding-right: 8px;">End:</div>
              <div style="text-align: left; flex: 1;">${maxEnd ? maxEnd.toLocaleDateString() : 'Ongoing'}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: right; min-width: 60px; padding-right: 8px;">Duration:</div>
              <div style="text-align: left; flex: 1;">${duration} days</div>
            </div>
          </div>
        `;
        tooltip.html(tooltipContent)
          .style('left', (event.pageX + 5) + 'px')
          .style('top', (event.pageY - 28) + 'px')
          .style('max-width', '250px')
          .style('pointer-events', 'none');
      })
      .on('mousemove', function (event, d) {
        const tooltip = d3.select('.tooltip');
        const { pageX, pageY } = event;
        const tooltipWidth = parseInt(tooltip.style('width'), 10);
        const tooltipHeight = parseInt(tooltip.style('height'), 10);
  
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
  
        let left = pageX + 5;
        let top = pageY - 28;
  
        if (pageX + tooltipWidth + 20 > viewportWidth) {
          left = pageX - tooltipWidth - 10;
        }
  
        if (pageY + tooltipHeight + 20 > viewportHeight) {
          top = pageY - tooltipHeight - 10;
        }
  
        tooltip.style('left', left + 'px').style('top', top + 'px');
      })
      .on('mouseout', function () {
        const tooltip = d3.select('.tooltip');
        tooltip.transition().duration(500).style('opacity', 0);
      });
  
    svg.append('g')
      .attr('class', 'x-axis-top')
      .call(d3.axisTop(x).tickSize(0))
      .attr('clip-path', 'url(#clip-x-axis)')
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-weight', '600')
      .style('font-size', '14px')
      .style('fill', '#0e0c22')
      .attr('y', -10);
  
    svg.append('g')
      .attr('class', 'y-axis-left')
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10).tickFormat(d => this.formatEventLabel(d as string)))
      .selectAll('text')
      .style('text-anchor', 'start')
      .attr('x', -120)
      .style('font-weight', d => ['Checking', 'Savings', 'Credit', 'Loan'].includes(d as string) ? '600' : 'normal')
      .style('font-size', d => ['Checking', 'Savings', 'Credit', 'Loan'].includes(d as string) ? '14px' : '12px')
      .style('fill', '#0e0c22')
      .style('cursor', 'pointer')
      .on('click', (event, d) => this.toggleTask(d as string));
  
    svg.append('g')
      .attr('class', 'x-axis-bottom')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(() => '').tickSize(0));
  
    svg.append('g')
      .attr('class', 'y-axis-right')
      .attr('transform', `translate(${width}, 0)`)
      .call(d3.axisRight(y).tickFormat(() => '').tickSize(0));
  
    svg.selectAll('.triangle')
      .data(filteredTasks)
      .enter()
      .append('path')
      .attr('d', d => {
        const width = 10;
        const height = 5;
        return `M0,${-height / 2} L${width / 2},${height / 2} L${-width / 2},${height / 2} Z`;
      })
      .attr('fill', '#0e0c22')
      .attr('transform', d => {
        const xPosition = -140;
        const yPosition = y(d.task)! + y.bandwidth() / 2;
        const rotation = d.expanded ? 180 : 90;
        return `translate(${xPosition}, ${yPosition}) rotate(${rotation})`;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        d.expanded = !d.expanded;
        this.drawGanttChart();
      });
  
    svg.selectAll('.x-axis-top path, .x-axis-bottom path')
      .style('stroke', '#dfe4ea');
  
    svg.selectAll('.y-axis-left path, .y-axis-right path')
      .style('stroke', '#dfe4ea');
  
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 4])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        svg.select<SVGGElement>('.x-axis-top').call(
          d3.axisTop(event.transform.rescaleX(x)).tickSize(0)
        );
  
        svg.selectAll('.x-axis-top text')
          .style('text-anchor', 'middle')
          .style('font-weight', '600')
          .style('font-size', '14px')
          .style('fill', '#0e0c22')
          .attr('y', -10);
  
        chartContainer.selectAll<SVGRectElement, any>('.bar')
          .attr('x', d => event.transform.applyX(x(d.start)))
          .attr('width', d => event.transform.k * (x(d.end) - x(d.start)));
  
        chartContainer.selectAll<SVGRectElement, any>('.span-bar')
          .attr('x', d => event.transform.applyX(x(d3.min(d.events, (e: Event) => e.start)!)))
          .attr('width', d => event.transform.k * (x(d3.max(d.events, (e: Event) => e.end)!) - x(d3.min(d.events, (e: Event) => e.start)!)));
  
        svg.selectAll<SVGLineElement, Event>('.grid-line')
          .attr('x1', d => event.transform.applyX(x(d.start)))
          .attr('x2', d => event.transform.applyX(x(d.start)));
  
        svg.select<SVGGElement>('.x-axis-bottom').call(
          d3.axisBottom(event.transform.rescaleX(x)).tickFormat(() => '').tickSize(0)
        );
      });
  
    svg.call(this.zoom);
  }

  adjustTooltipPosition(event: MouseEvent, tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>) {
    const containerRect = document.querySelector('.container')!.getBoundingClientRect();
    const { pageX, pageY } = event;
    const tooltipWidth = parseInt(tooltip.style('width'), 10);
    const tooltipHeight = parseInt(tooltip.style('height'), 10);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = pageX - containerRect.left + 5;
    let top = pageY - containerRect.top - 28;

    if (pageX + tooltipWidth + 20 > viewportWidth) {
      left = pageX - containerRect.left - tooltipWidth - 10;
    }

    if (pageY + tooltipHeight + 20 > viewportHeight) {
      top = pageY - containerRect.top - tooltipHeight - 10;
    }

    tooltip.style('left', left + 'px').style('top', top + 'px');
  }

  toggleTask(taskName: string): void {
    const memberId = this.memberIdFilter.nativeElement.value;
    if (!memberId || !this.memberData[memberId]) return;

    const tasks = this.memberData[memberId];
    const task = tasks.find(t => t.task === taskName);
    if (task) {
      task.expanded = !task.expanded;
      this.drawGanttChart();
    }
  }

  formatEventLabel(eventLabel: string): string {
    return eventLabel;
  }

  applyFilters(): void {
    this.updateDateRangeText();
    this.drawGanttChart();
  }

  filterTasks(): Task[] {
    const selectedTask = this.taskFilter.nativeElement.value;
    const start = new Date(this.startDate.nativeElement.value);
    const end = new Date(this.endDate.nativeElement.value);
    const memberId = this.memberIdFilter.nativeElement.value;

    if (!memberId || !this.memberData[memberId]) {
      return [];
    }

    return this.memberData[memberId]
      .filter(task => selectedTask === 'all' || task.task === selectedTask)
      .map(task => ({
        ...task,
        events: task.events.filter(event =>
          (isNaN(start.getTime()) || event.start >= start) &&
          (isNaN(end.getTime()) || event.end <= end)
        )
      }))
      .filter(task => task.events.length > 0);
  }

  updateDateRangeText(): void {
    const startInput = this.startDate.nativeElement.value;
    const endInput = this.endDate.nativeElement.value;
    const memberId = this.memberIdFilter.nativeElement.value;
    if (!memberId || !this.memberData[memberId]) {
      this.dateRangeText = '';
      return;
    }

    let startDate: Date | null = startInput ? new Date(startInput) : null;
    let endDate: Date | null = endInput ? new Date(endInput) : null;

    if (!startDate || isNaN(startDate.getTime())) {
      startDate = d3.min(this.memberData[memberId].flatMap(task => task.events), e => e.start)!;
    }
    if (!endDate || isNaN(endDate.getTime())) {
      endDate = d3.max(this.memberData[memberId].flatMap(task => task.events), e => e.end)!;
    }

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    this.dateRangeText = `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  }
}
