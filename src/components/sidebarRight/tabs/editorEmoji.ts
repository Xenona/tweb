import { IS_WEBM_SUPPORTED } from "../../../environment/videoSupport";
import createVideo from "../../../helpers/dom/createVideo";
import findUpTag from "../../../helpers/dom/findUpTag";
import { renderImageFromUrlPromise } from "../../../helpers/dom/renderImageFromUrl";
import framesCache from "../../../helpers/framesCache";
import { getMiddleware } from "../../../helpers/middleware";
import sequentialDom from "../../../helpers/sequentialDom";
import { MyDocument } from "../../../lib/appManagers/appDocsManager";
import appDownloadManager from "../../../lib/appManagers/appDownloadManager";
import { AppManagers } from "../../../lib/appManagers/managers";
import apiManagerProxy from "../../../lib/mtproto/mtprotoworker";
import lottieLoader from "../../../lib/rlottie/lottieLoader";
import rootScope from "../../../lib/rootScope";
import StickersTab from "../../emoticonsDropdown/tabs/stickers";
import LazyLoadQueue from "../../lazyLoadQueue";
import { videosCache } from "../../wrappers/sticker";
import RLottiePlayer from "../../../lib/rlottie/rlottiePlayer";
import { Canvaser } from "../../canvaser/Canvaser";
import { StickerLayer } from "../../canvaser/Sticker";
import { NoneTool } from "../../canvaser/Tool";

export class EditorElmojiTab {
  
  canvaser: Canvaser;
  container: HTMLElement;
  stickersTab: StickersTab;
  managers: AppManagers;
  curEmojiTool: NoneTool;

  constructor(canvaser: Canvaser) {
    this.canvaser = canvaser;
    this.managers = rootScope.managers;
    this.container = document.createElement('div');
    this.container.classList.add('editor-tab', 'emoji')
    this.curEmojiTool = new NoneTool(this.canvaser)
    
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
                this.canvaser.addLayer(new StickerLayer(this.canvaser, bitmap));
              });
            },
            { once: true },
          );
        } else if (img instanceof HTMLImageElement) {
          createImageBitmap(img).then((bitmap) => {
            this.canvaser.addLayer(new StickerLayer(this.canvaser, bitmap));
          });
        } else if (img instanceof HTMLVideoElement) {
          createImageBitmap(img).then((bitmap) => {
            this.canvaser.addLayer(new StickerLayer(this.canvaser, bitmap));
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
