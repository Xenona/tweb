import { c } from "vitest/dist/reporters-5f784f42";
import { IS_WEBM_SUPPORTED } from "../../../environment/videoSupport";
import createVideo from "../../../helpers/dom/createVideo";
import findUpClassName from "../../../helpers/dom/findUpClassName";
import findUpTag from "../../../helpers/dom/findUpTag";
import { attachVideoLeakListeners, leakVideoFallbacks, onVideoLeak, SHOULD_HANDLE_VIDEO_LEAK } from "../../../helpers/dom/handleVideoLeak";
import { renderImageFromUrlPromise } from "../../../helpers/dom/renderImageFromUrl";
import framesCache from "../../../helpers/framesCache";
import makeError from "../../../helpers/makeError";
import { getMiddleware } from "../../../helpers/middleware";
import noop from "../../../helpers/noop";
import { isSavingLottiePreview, saveLottiePreview } from "../../../helpers/saveLottiePreview";
import sequentialDom from "../../../helpers/sequentialDom";
import { PhotoSize } from "../../../layer";
import { MyDocument } from "../../../lib/appManagers/appDocsManager";
import appDownloadManager from "../../../lib/appManagers/appDownloadManager";
import { AppManagers } from "../../../lib/appManagers/managers";
import choosePhotoSize from "../../../lib/appManagers/utils/photos/choosePhotoSize";
import apiManagerProxy from "../../../lib/mtproto/mtprotoworker";
import lottieLoader from "../../../lib/rlottie/lottieLoader";
import rootScope from "../../../lib/rootScope";
import { ThumbCache } from "../../../lib/storages/thumbs";
import animationIntersector from "../../animationIntersector";
import StickersTab from "../../emoticonsDropdown/tabs/stickers";
import LazyLoadQueue from "../../lazyLoadQueue";
import { ICanvaser } from "../../popups/mediaEditor";
import { videosCache } from "../../wrappers/sticker";
import RLottiePlayer from "../../../lib/rlottie/rlottiePlayer";

export class EditorElmojiTab {
  
  canvaser: ICanvaser;
  container: HTMLElement;
  stickersTab: StickersTab;
  managers: AppManagers;
  constructor(canvaser: ICanvaser) {
    this.canvaser = canvaser;
    this.managers = rootScope.managers;
    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'emoji')
    
    const lazyLoadQueue = new LazyLoadQueue();

    const stickersTab = new StickersTab(this.managers)
    stickersTab.attachedLazyLoadQueue = lazyLoadQueue
    stickersTab.getContainerSize = () => {
      const containerRect  = this.container.getBoundingClientRect()
      return {
        width: containerRect.width,
        height: containerRect.height
      }
    }
    stickersTab.container.classList.add('active')
    this.container.append(stickersTab.container)
    stickersTab.customClick = (e) => {
      const target = findUpTag(e.target as HTMLElement, 'DIV');
      if(!target) return false;
      
      const docId = target.dataset.docId;
      if(!docId) return false;

      this.fetchFrameById(docId).then((img) => {
        if (img instanceof RLottiePlayer) {
          img.addEventListener(
            "enterFrame",
            () => {
              createImageBitmap(img.canvas[0]).then((bitmap) => {
                this.canvaser.addSticker(bitmap)
              });
            },
            { once: true },
          );
        } else if (img instanceof HTMLImageElement) {
          createImageBitmap(img).then((bitmap) => {
            this.canvaser.addSticker(bitmap)
          });
        }
      });
    }
      
    stickersTab.init();
  } 

  async fetchFrameById(docid: string) {
  
    const doc: MyDocument = await this.managers.appDocsManager.getDoc(docid);
    
    const middleware = getMiddleware().get();
    
    const stickerType = doc.sticker;
    let asStatic = false;
    if(stickerType === 1 || (stickerType === 3 && !IS_WEBM_SUPPORTED)) {
      asStatic = true;
    }  
    const div = document.createElement('div')
    const width = 180;
    const height = 180;
   
    const isAnimated = !asStatic && (stickerType === 2 || stickerType === 3);
  
    if(stickerType === 2 && !asStatic) {
      const blob = await appDownloadManager.downloadMedia({media: doc});
  
      const animation = await lottieLoader.loadAnimationWorker({
        container: div,
        animationData: blob,
        width,
        height,
        name: 'doc' + doc.id,
        needUpscale: true,
        middleware,
      });

      return animation;

    } else if(asStatic || stickerType === 3) {

      const cacheName = isAnimated ? framesCache.generateName('' + doc.id, 0, 0, undefined, undefined) : undefined;
      if(videosCache[cacheName]) {
        return videosCache[cacheName] as typeof promise;
      }

      let media: HTMLElement;
      if(asStatic) {
        media = new Image();
      } else {
        media = createVideo({middleware});
        (media as HTMLVideoElement).muted = true;
        (media as HTMLVideoElement).autoplay = true;
      }
      media.classList.add('media-sticker');

      const promise = new Promise<HTMLVideoElement | HTMLImageElement>(async(resolve, reject) => {
          let cacheContext = apiManagerProxy.getCacheContext(doc)
          renderImageFromUrlPromise(media, cacheContext.url, true).then(() =>  {
            sequentialDom.mutateElement(div, () => {
              if(isAnimated) {
                resolve(media as any);
                return;
              }
              div.append(media);
              resolve(media as any);
            });
          })
      });

      return promise;
    }
  }
}
