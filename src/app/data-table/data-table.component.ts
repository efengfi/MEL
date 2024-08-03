import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { TableService } from '../table.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface UserData {
  type: string;
  md_access_number: string;
  src_id: string;
  dst_id: string;
  src_Event: string;
  dst_Event_id: string;
  Date: string;
  HOUSEHOLD_ID: string;
  DOB: string;
  label_segment: string;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['type', 'md_access_number', 'src_id', 'dst_id', 'src_Event', 'dst_Event_id', 'Date', 'HOUSEHOLD_ID', 'DOB', 'label_segment'];
  dataSource!: MatTableDataSource<UserData>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private service: TableService) { }

  ngAfterViewInit() {
    this.service.getData().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
