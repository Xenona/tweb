import { IS_WEBM_SUPPORTED } from "../../../environment/videoSupport";
import createVideo from "../../../helpers/dom/createVideo";
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
        console.log("XE maaaaagic", img)
        // this.canvaser.addSticker(img)
      });
    }
      
    stickersTab.init();
  } 

  async fetchFrameById(docid: string) {
  
    const doc: MyDocument = await this.managers.appDocsManager.getDoc(docid);
    
    const middleware = getMiddleware().get();
    const middlewareError = makeError('MIDDLEWARE');
    const stickerType = doc.sticker;
    let asStatic = false;
    if(stickerType === 1 || (stickerType === 3 && !IS_WEBM_SUPPORTED)) {
      asStatic = true;
    }  
    const div = [document.createElement('div')]
    const width = 180;
    const height = 180;
    const getThumbFromContainer = (container: HTMLElement) => {
      let element = container.firstElementChild as HTMLElement;
      if(element && element.classList.contains('premium-sticker-lock')) {
        element = element.nextElementSibling as HTMLElement;
      }
    
      return element;
    };
    const onAnimationEnd = (element: HTMLElement, onAnimationEnd: () => void, timeout: number) => {
      const onEnd = () => {
        element.removeEventListener('animationend', onEnd);
        onAnimationEnd();
        clearTimeout(_timeout);
      };
      element.addEventListener('animationend', onEnd);
      const _timeout = setTimeout(onEnd, timeout);
    };
    const isAnimated = !asStatic && (stickerType === 2 || stickerType === 3);
    let cacheContext: ThumbCache;
    
    const getCacheContext = (type: string = cacheContext?.type) => {
      return cacheContext = apiManagerProxy.getCacheContext(doc, type);
    };
  
    const load = async() => {
      if(!middleware()) {
        throw middlewareError;
      }
  
      if(stickerType === 2 && !asStatic) {
        const blob = await appDownloadManager.downloadMedia({media: doc});
        if(middleware && !middleware()) {
          throw middlewareError;
        }
  
        const animation = await lottieLoader.loadAnimationWorker({
          container: (div as HTMLElement[])[0],
          loop: true,
          autoplay: true,
          animationData: blob,
          width,
          height,
          name: 'doc' + doc.id,
          needUpscale: true,
          // skipRatio,
          // toneIndex,
          // sync: isCustomEmoji,
          middleware,
          // group,
          // liteModeKey: liteModeKey || undefined,
          // textColor: !isCustomEmoji ? textColor : undefined
        });
        // const deferred = deferredPromise<void>();
  
        const onFirstFrame = (container: HTMLElement, canvas: HTMLCanvasElement) => {
          let element = getThumbFromContainer(container);
          element = element !== canvas && element as HTMLElement;
     
  
          const cb = () => {
            if(
              element &&
              element !== canvas &&
              element.tagName !== 'DIV'
            ) {
              element.remove();
            }
          };
  
         {
            sequentialDom.mutate(() => {
              canvas && canvas.classList.add('fade-in');
              if(element) {
                element.classList.add('fade-out');
              }
  
              onAnimationEnd(canvas || element, () => {
                sequentialDom.mutate(() => {
                  canvas && canvas.classList.remove('fade-in');
                  cb();
                });
              }, 400);
            });
          }
        };
  
        animation.addEventListener('firstFrame', () => {
          const canvas = animation.canvas[0];
        
   
            (div as HTMLElement[]).forEach((container, idx) => {
              onFirstFrame(container, animation.canvas[idx]);
            });
        }, {once: true});
   
  
        return animation;
  
        // return deferred;
        // await new Promise((resolve) => setTimeout(resolve, 5e3));
      } else if(asStatic || stickerType === 3) {
        const isSingleVideo = isAnimated;
        const cacheName = isSingleVideo ? framesCache.generateName('' + doc.id, 0, 0, undefined, undefined) : undefined;
  
        const cachePromise = videosCache[cacheName];
        if(cachePromise) {
          return cachePromise as typeof promise;
        }
        const d = isSingleVideo ? (div as HTMLElement[]).slice(0, 1) : div as HTMLElement[];
        const media: HTMLElement[] = d.map(() => {
          let media: HTMLElement;
          if(asStatic) {
            media = new Image();
          } else {
            const video = media = createVideo({middleware});
            video.muted = true;
            video.autoplay = true;
            video.loop = true;
            video._autoplay = true;
            video._loop = true;
  
            
          }
  
          media.classList.add('media-sticker');
          return media;
        });
     
        const thumbImage = (div as HTMLElement[]).map((div, idx) => {
          const thumb = getThumbFromContainer(div);
          return (thumb as HTMLElement) !== media[idx] && thumb;
        }) as HTMLElement[];
      
       
        const promise = new Promise<HTMLVideoElement[] | HTMLImageElement[]>(async(resolve, reject) => {
          const r = async() => {
            if(middleware && !middleware()) {
              reject(middlewareError);
              return;
            }
  
            const mediaLength = media.length;
            const loaded: HTMLElement[] = [];
            const onLoad = (div: HTMLElement, media: HTMLElement, thumbImage: HTMLElement) => {
              sequentialDom.mutateElement(div, () => {
                if(middleware && !middleware()) {
                  reject(middlewareError);
                  return;
                }
  
                if(!media) {
                  if(!isSingleVideo || !isAnimated) {
                    thumbImage?.remove();
                  }
  
                  return;
                }
  
                const isVideo = media instanceof HTMLVideoElement;
                if(isVideo/*  && media.isConnected */) {
                  // * video sticker can have arbitrary dimensions
                  const {videoWidth, videoHeight} = media;
                  const ratio = videoWidth / videoHeight;
  
                  let w = width * window.devicePixelRatio;
                  let h = height * window.devicePixelRatio;
                  if(ratio < 1) {
                    w = h * ratio;
                  } else {
                    h = w / ratio;
                  }
  
                  if(!isSavingLottiePreview(doc, -1, w, h)) {
                    // const perf = performance.now();
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(media, 0, 0, canvas.width, canvas.height);
                    saveLottiePreview(doc, canvas, -1);
                    // console.log('perf', performance.now() - perf);
                  }
                }
  
                if(isSingleVideo) {
                  resolve(media as any);
                  return;
                }
  
                if(isVideo && SHOULD_HANDLE_VIDEO_LEAK) {
                  leakVideoFallbacks.set(media, () => {
                    const reset = () => {
                      onVideoLeak(media).catch(noop);
                    };
  
                     
                      media.replaceWith(thumbImage);
                      reset();
                  });
  
                  if(media.duration < 1 ||
                    media.getVideoPlaybackQuality().totalVideoFrames < 10) {
                    const detach = attachVideoLeakListeners(media);
                    middleware.onClean(detach);
                  }
                }
  
                div.append(media);
  
                thumbImage?.remove();
  
                if(isAnimated) {
                  animationIntersector.addAnimation({
                    animation: media as HTMLVideoElement,
                    observeElement: div,
                    controlled: middleware,
                    type: 'video'
                  });
                }
  
                if(loaded.push(media) === mediaLength) {
                  resolve(loaded as any);
                }
              });
            };
  
            getCacheContext();
            let lastPromise: Promise<any>;
            (div as HTMLElement[]).forEach((div, idx) => {
              const _media = media[idx];
              const cb = () => onLoad(div, _media, thumbImage[idx]);
              if(_media) lastPromise = renderImageFromUrlPromise(_media, cacheContext.url, true);
              lastPromise.then(cb);
            });
          };
  
          getCacheContext();
          if(cacheContext.url) r();
          else {
            let promise: Promise<any>;
            if(stickerType !== 1 && asStatic) {
              const thumb = choosePhotoSize(doc, width, height, false) as PhotoSize.photoSize;
              // promise = managers.appDocsManager.getThumbURL(doc, thumb).promise
              promise = appDownloadManager.downloadMediaURL({media: doc, thumb});
            } else {
              promise = appDownloadManager.downloadMediaURL({media: doc});
            }
  
            promise.then(r, reject);
          }
        });
  
        if(cacheName) {
           
        }
  
        return promise;
      }
    };
  
    return load()
  }
  
  
}
