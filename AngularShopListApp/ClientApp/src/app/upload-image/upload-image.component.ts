import { Component, OnInit } from '@angular/core';
import { UploadFilesService } from 'src/app/upload-image/services/upload-image.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NewitemService } from '../newitem/newitem.service';
import { Newitem } from '../newitem/newitem';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css']
})
export class UploadImageComponent implements OnInit {

  selectedFiles: FileList;
  progressInfos = [];
  message = '';
  newitem: Newitem;

  fileInfos: Observable<any>;

  constructor(private uploadService: UploadFilesService, private route: ActivatedRoute, public newitemservce: NewitemService) { }

  ngOnInit() {
    this.fileInfos = this.uploadService.getFiles();
  }

  selectFiles(event): void {
    this.progressInfos = [];

    const files = event.target.files;
    let isImage = true;

    for (let i = 0; i < files.length; i++) {
      if (files.item(i).type.match('image.*')) {
        continue;
      } else {
        isImage = false;
        alert('invalid format!');
        break;
      }
    }

    if (isImage) {
      this.selectedFiles = event.target.files;
    } else {
      this.selectedFiles = undefined;
      event.srcElement.percentage = null;
    }
  }

  uploadFiles(): void {
    this.message = '';

    for (let i = 0; i < this.selectedFiles.length; i++) {
      this.upload(i, this.selectedFiles[i]);
    }
  }

  upload(idx, file): void {
    this.progressInfos[idx] = { value: 0, fileName: file.name };
    
    var id = this.route.snapshot.params['newiemId'];
    console.log(id);
    console.log(file.name);

    this.uploadService.upload(file).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressInfos[idx].percentage = Math.round(100 * event.loaded / event.total);
          console.log('progressInfos')
        } else if (event instanceof HttpResponse) {
          this.fileInfos = this.uploadService.getFiles();
          //alert('File Uplodeded ');
          console.log(this.fileInfos)
          console.log('HttpResponse')

          this.newitemservce.find(id).subscribe((data: Newitem) => {
            console.log('find');
            console.log(data[0]);
            this.newitem = data[0];
            this.newitem.pic = file.name;

            this.newitemservce.update(id, this.newitem).subscribe(res => {
              console.log('new item updated successfully!');
            })

          });
        }
      },
      err => {
        this.progressInfos[idx].percentage = 0;
        this.message = 'Could not upload the file:' + file.name;
      });
  }


}
