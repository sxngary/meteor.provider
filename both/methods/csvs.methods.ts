import { UploadFS } from 'meteor/jalik:ufs';
import { CsvsStore } from '../collections/csvs.collection';

export function upload(data: File): Promise<any> {
  return new Promise((resolve, reject) => {
    // pick from an object only: name, type and size
    const file = {
      name: data.name,
      type: data.type,
      size: data.size,
      stats: {
          isPending: true,
          isProcessing: false,
          isCompleted: false
      }
    };

    const upload = new UploadFS.Uploader({
      data,
      file,
      store: CsvsStore,
      onError: reject,
      onComplete: resolve
    });

    upload.start();
  });
}