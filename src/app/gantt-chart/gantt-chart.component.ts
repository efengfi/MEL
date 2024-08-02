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

interface Member {
  dateOfBirth: Date;
  tasks: Task[];
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

  currentDate = new Date();

  memberData: { [memberId: string]: Member } = {
    '10': {
      dateOfBirth: new Date(1980, 8, 18), // Month is 0-based, so 8 represents September
      tasks: [
        { task: 'Checking', events: [
          { name: 'Open', start: new Date(1996, 5, 1), end: new Date(2012, 3, 31) },
          { name: 'Dormant', start: new Date(1996, 5, 4), end: new Date(2005, 3, 31) },
          { name: 'Closed', start: new Date(2012, 3, 31), end: new Date(2015, 5, 27) },
          { name: 'Open', start: new Date(2015, 5, 27), end: new Date(2024, 7, 27) }
        ], expanded: true },
        { task: 'Savings', events: [
          { name: 'Open', start: new Date(1996, 2, 3), end: new Date(2012, 3, 31) },
          { name: 'Closed', start: new Date(2012, 3, 31), end: new Date(2024, 7, 30) },
        ], expanded: true },
        { task: 'Loan', events: [
          { name: 'Originating', start: new Date(2010, 3, 9), end: new Date(2024, 3, 10) },
          { name: 'Active', start: new Date(2010, 3, 9), end: new Date(2024, 3, 10) },
          { name: 'Paid', start: new Date(2020, 3, 20), end: new Date(2024, 3, 25) }
        ], expanded: true },
        { task: 'Credit', events: [
          { name: 'Open', start: new Date(2000, 7, 9), end: new Date(2024, 7, 31) },
          { name: 'Dormant', start: new Date(2001, 2, 13), end: new Date(2002, 3, 15) },
          { name: 'Card Change', start: new Date(2002, 5, 20), end: new Date(2002, 6, 22) },
        ], expanded: true },
      ]
    }
  };

  uniqueTasks = ['Checking', 'Savings', 'Credit', 'Loan'];
  sampleMemberIds = Object.keys(this.memberData);
  svgWidth: number = 800;
  svgHeight: number = 600; // Initialize with a default height
  zoom: any;
  dateRangeText: string = '';
  dateOfBirthText: string = '';

  constructor() {}

  ngOnInit(): void {
    this.calculateSvgWidth();
    this.updateDateRangeText();
    this.updateDateOfBirthText();
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
    const containerHeight = document.querySelector('.gantt-chart')?.clientHeight || 600; // Default to 600 if not found
    const padding = 20;
    this.svgWidth = containerWidth - padding;
    this.svgHeight = containerHeight - padding; // Adjust the SVG height based on the container height
    this.drawGanttChart();
  }

  drawGanttChart(): void {
    d3.select('svg').selectAll('*').remove();
    const filteredTasks = this.filterTasks();
    const margin = { top: 30, right: 0, bottom: 15, left: 249.65, right2: 0, left2: 140 };
    const width = this.svgWidth - margin.left - margin.right - margin.right2;
    const height = this.svgHeight - margin.top - margin.bottom;
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
      .domain(['Open', 'Dormant', 'Closed', 'Card Change', 'Paid'])
      .range(['#4bd192', '#ffe047', '#ed596f', '#53aef4', '#4bd192']);
  
    const minDate = d3.min(filteredTasks.flatMap(task => task.events), e => e.start)!;
    const maxDate = d3.max(filteredTasks.flatMap(task => task.events), e => e.end)!;
  
    const x = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);
  
    const y = d3.scaleBand()
      .domain(filteredTasks.flatMap(task => [task.task, ...(task.expanded ? task.events.map(event => `${task.task}-${event.name}`) : [])]))
      .range([0, height])
      .paddingInner(0.35)
      .paddingOuter(0.35);
  
    const durationY = d3.scaleBand()
      .domain(filteredTasks.flatMap(task => [task.task, ...(task.expanded ? task.events.map(event => `${task.task}-${event.name}`) : [])]))
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
      .style('stroke', '#dfe4ea')
      .style('stroke-dasharray', '2,2');
  
    chartContainer.selectAll('.span-bar')
      .data(filteredTasks)
      .enter().append('rect')
      .attr('class', 'span-bar')
      .attr('x', d => x(d3.min(d.events, e => e.start)!))
      .attr('y', d => y(d.task)! + y.bandwidth() * 0.25)
      .attr('width', d => x(d3.max(d.events, e => e.end)!) - x(d3.min(d.events, e => e.start)!))
      .attr('height', y.bandwidth() * 0.5)
      .attr('fill', '#979dad')
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
      .attr('y', d => y(`${d.task}-${d.name}`)!)
      .attr('width', d => x(d.end) - x(d.start))
      .attr('height', y.bandwidth())
      .attr('fill', d => color(d.name))
      .attr('stroke', d => d3.color(color(d.name))!.darker(1).toString())
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
      .style('font-size', '12px')
      .style('fill', '#0c0d0e')
      .attr('y', -10);
  
    svg.append('g')
      .attr('class', 'y-axis-left')
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10).tickFormat(d => this.formatEventLabel(d as string)))
      .selectAll('text')
      .style('text-anchor', 'start')
      .attr('x', -224)
      .style('font-weight', d => ['Checking', 'Savings', 'Credit', 'Loan'].includes(d as string) ? 'bold' : 'normal')
      .style('font-size', d => ['Checking', 'Savings', 'Credit', 'Loan'].includes(d as string) ? '14px' : '12px')
      .style('fill', '#0c0d0e')
      .style('cursor', 'pointer')
      .on('click', (event, d) => this.toggleTask(d as string));
  
    svg.append('g')
      .attr('class', 'x-axis-bottom')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(() => '').tickSize(0));
  
    svg.append('g')
      .attr('class', 'y-axis-duration')
      .attr('transform', `translate(${margin.left2 - 180}, 0)`)
      .call(d3.axisLeft(durationY).tickFormat(d => this.formatDurationLabel(d as string, filteredTasks)).tickSize(0))
      .selectAll('path')
      .style('stroke', 'none');
  
    svg.selectAll('.y-axis-duration text')
      .style('font-size', '12px')
      .attr('text-anchor', 'start')
      .attr('x', -40);
  
    svg.append('g')
      .attr('class', 'y-axis-duration-span')
      .attr('transform', `translate(${margin.left2 - 180}, 0)`)
      .call(d3.axisLeft(durationY).tickFormat(d => this.formatDurationLabelForSpan(d as string, filteredTasks)).tickSize(0))
      .selectAll('path')
      .style('stroke', 'none');
  
    svg.selectAll('.y-axis-duration-span text')
      .style('font-size', '12px')
      .attr('text-anchor', 'start')
      .attr('x', -40);
  
    svg.selectAll('.triangle')
      .data(filteredTasks)
      .enter()
      .append('path')
      .attr('d', d => {
        const width = 10;
        const height = 5;
        return `M0,${-height / 2} L${width / 2},${height / 2} L${-width / 2},${height / 2} Z`;
      })
      .attr('fill', '#0c0d0e')
      .attr('transform', d => {
        const xPosition = -234;
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
      .style('stroke', 'none');
  
    svg.selectAll('.y-axis-left path, .y-axis-right path')
      .style('stroke', 'none');
  
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
          .style('font-size', '12px')
          .style('fill', '#0c0d0e')
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
  
        svg.selectAll('text')
          .style('font-family', "sans-serif");
  
        // Remove axis strokes when zooming
        svg.selectAll('.x-axis-top path, .x-axis-bottom path')
          .style('stroke', 'none');
  
        svg.selectAll('.y-axis-left path, .y-axis-right path')
          .style('stroke', 'none');
      });
  
    svg.call(this.zoom);
  
    svg.selectAll('text')
      .style('font-family', "sans-serif");
  
    const verticalLine = svg.append('line')
      .attr('class', 'vertical-line')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke-width', 1)
      .attr('stroke', '#ed780f')
      .style('display', 'none')
      .style('pointer-events', 'none');
  
    svg.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      if (mouseX >= 0 && mouseX <= width) {
        verticalLine.style('display', null)
          .attr('x1', mouseX)
          .attr('x2', mouseX);
      } else {
        verticalLine.style('display', 'none');
      }
    });
  
    svg.on('mouseleave', () => {
      verticalLine.style('display', 'none');
    });
  }
  

  formatDurationLabel(eventLabel: string, tasks: Task[]): string {
    const [taskName, eventName] = eventLabel.split('-');
    const task = tasks.find(t => t.task === taskName);
    if (!task) return '';
    const event = task.events.find(e => e.name === eventName);
    if (!event) return '';

    const duration = Math.ceil((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60 * 24));
    return `${duration} days`;
  }

  formatDurationLabelForSpan(eventLabel: string, tasks: Task[]): string {
    const task = tasks.find(t => t.task === eventLabel);
    if (!task) return '';

    const minStart = d3.min(task.events, e => e.start)!;
    const maxEnd = d3.max(task.events, e => e.end)!;

    const duration = Math.ceil((maxEnd.getTime() - minStart.getTime()) / (1000 * 60 * 60 * 24));
    return `${duration} days`;
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

    const tasks = this.memberData[memberId].tasks;
    const task = tasks.find(t => t.task === taskName);
    if (task) {
      task.expanded = !task.expanded;
      this.drawGanttChart();
    }
  }

  formatEventLabel(eventLabel: string): string {
    const [taskName, eventName] = eventLabel.split('-');
    return eventName || taskName;
  }

  applyFilters(): void {
    this.updateDateRangeText();
    this.updateDateOfBirthText();
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

    return this.memberData[memberId].tasks
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
      startDate = d3.min(this.memberData[memberId].tasks.flatMap(task => task.events), e => e.start)!;
    }
    if (!endDate || isNaN(endDate.getTime())) {
      endDate = d3.max(this.memberData[memberId].tasks.flatMap(task => task.events), e => e.end)!;
    }

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    this.dateRangeText = `Activity: ${startDate.toLocaleDateString('en-US', options)} to ${endDate.toLocaleDateString('en-US', options)}`;
  }

  updateDateOfBirthText(): void {
    const memberId = this.memberIdFilter.nativeElement.value;
    if (!memberId || !this.memberData[memberId]) {
      this.dateOfBirthText = '';
      return;
    }

    const dateOfBirth = this.memberData[memberId].dateOfBirth;
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    this.dateOfBirthText = `Date of Birth: ${dateOfBirth.toLocaleDateString('en-US', options)}`;
  }
}
