import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { loadLayersFromYaml } from './layer-config';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapView', { static: true })
  private mapViewElement!: ElementRef<HTMLDivElement>;

  private view?: MapView;
  private destroyed = false;
  protected configurationError = '';

  ngAfterViewInit(): void {
    void this.initializeMap();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.view?.destroy();
  }

  private async initializeMap(): Promise<void> {
    try {
      const configUrl = new URL('config/layers.yaml', document.baseURI).toString();
      const layers = await loadLayersFromYaml(configUrl);

      if (this.destroyed) {
        layers.forEach((layer) => layer.destroy());
        return;
      }

      const map = new ArcGISMap({
        basemap: 'gray-vector',
        layers,
      });

      this.view = new MapView({
        container: this.mapViewElement.nativeElement,
        map,
        center: [5.3, 52.2],
        zoom: 8,
      });
    } catch (error) {
      this.configurationError = error instanceof Error ? error.message : 'Unknown layer configuration error.';
    }
  }
}
