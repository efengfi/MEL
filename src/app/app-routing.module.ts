import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataDashboardComponent } from './data-dashboard/data-dashboard.component';
// Import other components as needed

const routes: Routes = [
  { path: 'datadashboard', component: DataDashboardComponent },
  // Define other routes here
  // Example: { path: 'home', component: HomeComponent },
  // Example: { path: 'about', component: AboutComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },  // Redirect to a default route, e.g., 'home'
  { path: '**', redirectTo: '/home' }  // Wildcard route for a 404 page, redirect to 'home'
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
