import type { AreaOptions, IPos, IData, LWChartTextStyle, IObj, IToolTipOption, IToolTipOptForDraw } from './utils/interfaces';
import type { ICurvePoint} from './utils';
import { getCurveList, now, curveWithTime } from './utils';
import Axis from './axis';
import { drawToolTip } from './utils/tooltip';

interface IAreaPos extends IPos {
  xRange: number[];
  yRange: number[];
}

interface ICurveListItem {
  segmentAnimateDuration: number;
  segmentAnimatePercent: number;
  segmentAnimateStartTime: number;
  animationList: ICurvePoint[],
  list: ICurvePoint[],
}

export default class Area extends Axis<AreaOptions> {
  constructor (el: HTMLElement, options?: AreaOptions) {
    super(el, options);
    this.init(options);
  }

  private adsorptionLastTimer: number = 0;

  protected areaLineWidth: number = 0;
  protected areaDotRadius: number = 0;
  protected areaDotLineWidth: number = 0;
  protected areaActiveDotLineWidth: number = 0;
  protected subLineWidth: number = 0;
  protected areaActiveDotRadius: number = 0;
  protected pointList: IAreaPos[][] = [];
  protected curveList: ICurveListItem[] = [];
  protected activeData = {} as IData;
  protected isFinishedAnimation: boolean = false;
  protected animationHandle: number = 0;
  protected handleMoveTimer: number = 0;

  protected drawResult () {
    if (!this.ctx) return;
    const { showResult, resultFormat, resultStyle, drawResult, showToolTip, toolTipOpt } = this.options;
    if (showResult === false) return;
    if (typeof drawResult === 'function') {
      this.ctx.save();
      drawResult.call(this, this.ctx, this.activeData, {
        dpi: this.dpi,
        mousePosition: this.mousePosition,
        canvasRect: {
          startX: 0,
          startY: 0,
          endX: this.canvasWidth,
          endY: this.canvasHeight,
          width: this.canvasWidth,
          height: this.canvasHeight
        },
        chartRect: {
          startX: this.chartStartX,
          startY: this.chartStartY,
          endX: this.chartEndX,
          endY: this.chartEndY,
          width: this.chartWidth,
          height: this.chartHeight
        }
      });
      this.ctx.restore();
      return;
    }
    const resultStr = typeof resultFormat === 'function' ? resultFormat(this.activeData) : `${ this.activeData.xAxisVal } ${this.activeData.yAxisVal}`;

    if (showToolTip) {
      const toolTipStyle: IToolTipOptForDraw = Object.assign({
        text: resultStr,
        x: this.activeData.x,
        y: this.activeData.y,
        chartX: this.chartStartX,
        chartY: this.chartStartY,
        chartWidth: this.chartWidth,
        chartHeight: this.chartHeight,
        dpi: this.dpi
      }, toolTipOpt);

      const dpiToolTipOpts: (keyof IToolTipOptForDraw)[] = ['size', 'width', 'height', 'borderRadius'];

      dpiToolTipOpts.map(key => {
        if (typeof toolTipStyle[key] === 'number') {
          const originVal: number = toolTipStyle[key] as number;
          (toolTipStyle as unknown as IObj<number>)[key] = originVal * this.dpi;
        }
      });
      drawToolTip(this.ctx, toolTipStyle);
      return;
    }

    const style: LWChartTextStyle = Object.assign({}, resultStyle);
    const dpiOpts: (keyof LWChartTextStyle)[] = ['x', 'y', 'size', 'maxWidth'];
    dpiOpts.map(key => {
      if (typeof style[key] === 'number') {
        const originVal: number = style[key] as number;
        (style as IObj<number>)[key] = originVal * this.dpi;
      }
    });
    this.ctx.save();
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'end';
    this.drawText(resultStr, style);
    this.ctx.restore();
  }

  protected drawDot () {
    if (!this.ctx || this.pointList.length <= 0) return;
    this.activeData = {} as IData;
    const { x, y } = this.mousePosition;
    const areaDotFillColor = this.options.areaDotFillColor || ['#fff'];
    const areaDotStorkColor = this.options.areaDotStorkColor || ['rgba(233, 28, 65, 1)'];
    const areaActiveDotFillColor = this.options.areaActiveDotFillColor || ['rgba(233, 28, 65, 0.3)'];
    const areaActiveDotStorkColor = this.options.areaActiveDotStorkColor || ['rgba(233, 28, 65, 0.3)'];
    for (let i = 0; i < this.pointList.length; i++) {
      this.ctx.save();
      this.ctx.fillStyle = areaDotFillColor[i] || areaDotFillColor[areaDotFillColor.length - 1];
      this.ctx.strokeStyle = areaDotStorkColor[i] || areaDotStorkColor[areaDotStorkColor.length - 1] ;
      this.ctx.lineWidth = this.areaDotLineWidth;
      const pointListItem = this.pointList[i];
      for (let j = 0; j < pointListItem.length; j++) {
        const item = pointListItem[j];
        drawActiveDot: {
          // ?????????????????????????????????????????????
          if (Object.keys(this.activeData).length > 0) break drawActiveDot;
          const yInChart = this.options.adsorptionLast || y >= this.chartStartY && y <= this.chartEndY;
          if (yInChart && x >= item.xRange[0] && x <= item.xRange[1]) {
            // ????????????????????????????????? Y ????????????
            if (this.yAxisData.length > 1) {
              if (y < item.yRange[0] || y > item.yRange[1]) break drawActiveDot;
            }
            this.activeData = {
              group: i,
              xAxisVal: this.xAxisData[j],
              yAxisVal: this.yAxisData[i][j],
              x: item.x,
              y: item.y
            };

            const subLineColor = this.options.subLineColor || '#FF2D55';
            const segments = [5, 3].map(this.formatNumParam.bind(this));
            // ???????????????
            if (this.options.showActiveXSubLine) {
              this.drawLine(this.chartStartX, item.y, item.x, item.y, this.subLineWidth, subLineColor, segments);
            }
            if (this.options.showActiveYSubLine) {
              this.drawLine(item.x, item.y, item.x, this.chartEndY, this.subLineWidth, subLineColor, segments);
            }

            this.drawResult();
            if (this.options.areaShowActiveDot === false) break drawActiveDot;

            // ?????????????????????
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.lineWidth = this.areaActiveDotLineWidth;
            this.ctx.fillStyle = areaActiveDotFillColor[i] || areaActiveDotFillColor[length - 1];
            this.ctx.strokeStyle = areaActiveDotStorkColor[i] || areaActiveDotStorkColor[areaDotStorkColor.length - 1] ;
            this.ctx.arc(item.x, item.y, this.areaActiveDotRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.restore();
          }
        }
        if (this.options.areaShowDot === false) continue;
        // ????????????
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, this.areaDotRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
      }
      this.ctx.beginPath();
      this.ctx.restore();
    }
  }

  protected onMove () {
    if(this.handleMoveTimer) window.clearTimeout(this.handleMoveTimer);
    this.handleMoveTimer = window.setTimeout(() => {
      // ?????????????????????canvas
      this.drawCanvas();
    }, 10);
  }

  protected onMouseLeave () {
    if(this.adsorptionLastTimer) window.clearTimeout(this.adsorptionLastTimer);
    this.adsorptionLastTimer = window.setTimeout(() => {
      // ???????????? canvas ????????????
      this.drawCanvas();
    }, 500);
  }

  /**
   *
   * ?????????????????????????????????????????????????????????????????????
   *
   * It needs to be called in the constructor of the implementation class
   * ??????????????????????????????????????????
   */
  protected init (options?: AreaOptions) {
    this.mergeOptions(options);
    this.setParamsWithDpi();
    this.initSize();
    this.initData();
  }

  /** ???????????????????????? */
  protected adsorptionToLast () {
    if (this.options.adsorptionLast !== true || this.mouseInCanvas) return;
    const pointList = this.pointList[0];
    if (pointList.length <= 0) return;
    const lastIndex = pointList.length - 1;
    const x = pointList[lastIndex].x;
    const y = pointList[lastIndex].y;
    this.mousePosition = { x, y };
  }

  /**
   * @overwrite
   * ?????????????????????????????????????????????????????????
   */
  protected mergeOptions(options?: AreaOptions) {
    // ????????????????????????
    const defaultOpt: AreaOptions = {
      areaLineColor: ['rgba(233, 28, 65, 1)'],
      areaLineWidth: 2,
      areaStartColor: ['rgba(233, 28, 65, 1)'],
      areaEndColor: ['rgba(246, 60, 118, 0)'],
      areaShowDot: true,
      areaShowActiveDot: true,
      areaDotRadius: 2.5,
      areaDotLineWidth: 2,
      areaDotFillColor: ['#fff'],
      areaDotStorkColor: ['rgba(233, 28, 65, 1)'],
      areaActiveDotRadius: 8,
      areaActiveDotFillColor: ['rgba(233, 28, 65, 0.3)'],
      subLineColor: '#FF2D55',
      subLineWidth: 1,
      showResult: true,
      resultStyle: undefined,
      showAnimation: true,
      animationDuration: 1000,
      showToolTip: false,
      toolTipOpt: undefined,
      adsorptionLast: false
    };
    this.options = Object.assign({}, defaultOpt, this.options);
    const defaultResultStyle: LWChartTextStyle = {
      size: 12,
      font: 'PingFangSC-Semibold PingFang SC',
      weight: 'normal',
      x: (this.el?.offsetWidth || 30) - 30,
      y: this.options.titleStyle?.y || 20,
      color: '#666'
    };
    const defaultToolTipOpt: IToolTipOption = {
      width: 62,
      height: 35,
      borderRadius: 6,
      color: '#fff',
      bgColor: '#0A1F44',
      size: 12
    };
    const resultStyle = Object.assign({}, defaultResultStyle, this.options.resultStyle);
    const toolTipOpt = Object.assign({}, defaultToolTipOpt, this.options.toolTipOpt);
    this.options.resultStyle = resultStyle;
    this.options.toolTipOpt = toolTipOpt;
    // ???????????????????????????????????????????????????
    super.mergeOptions(options);
  }
  /** ????????????????????????????????? dpi????????????????????????????????? */
  protected setParamsWithDpi(): void {
    const { areaLineWidth, areaDotRadius, areaDotLineWidth, areaActiveDotRadius, areaActiveDotLineWidth, subLineWidth } = this.options;
    this.areaLineWidth = this.formatNumParam(areaLineWidth);
    this.areaDotRadius = this.formatNumParam(areaDotRadius);
    this.areaDotLineWidth = this.formatNumParam(areaDotLineWidth);
    this.areaActiveDotRadius = this.formatNumParam(areaActiveDotRadius);
    this.areaActiveDotLineWidth = this.formatNumParam(areaActiveDotLineWidth);
    this.subLineWidth = this.formatNumParam(subLineWidth);
  }
  protected afterInitData(): void {
    const ditDiameter = this.areaDotRadius * 2;
    const halfXRange = this.yAxisData.length === 1 ? (this.getPosX(1) - this.chartStartX) / 2 : ditDiameter;
    this.pointList = this.yAxisData.map(yAxisDataItem => {
      return yAxisDataItem.map((val, index) => {
        const posX = this.getPosX(index);
        const posY = this.getPosY(val);
        return {
          x: posX,
          y: posY,
          xRange: [posX - halfXRange, posX + halfXRange],
          yRange: [posY - ditDiameter, posY + ditDiameter]
        };
      });
    });
    const animationDuration = this.options.animationDuration || 1000;
    this.curveList = this.pointList.map(item => {
      const chartArea = {
        left: this.chartStartX,
        right: this.chartEndX,
        top: this.chartStartY,
        bottom: this.chartEndY
      };
      const curveList = getCurveList(item, chartArea);
      const curveListFirstItem = curveList[0];
      let animationList = curveList;
      if (this.options.showAnimation) {
        animationList = curveListFirstItem ? [curveListFirstItem] : [];
      }
      return {
        segmentAnimateDuration: animationDuration / Math.max(item.length - 1, 1),
        segmentAnimatePercent: 0,
        segmentAnimateStartTime: now(),
        animationList,
        list: curveList
      };
    });
    this.drawCanvas();
  }

  protected drawCanvas () {
    let isFinishedAnimation: boolean = true;
    this.curveList.map(item => {
      const animationLen = item.animationList.length;
      const animationDuration = now() - item.segmentAnimateStartTime;
      const listLen = item.list.length;
      if (animationLen < listLen) {
        isFinishedAnimation = false;
      }
      item.segmentAnimatePercent = Math.min(1, animationDuration / item.segmentAnimateDuration) * 100;
      if (animationLen < listLen && item.segmentAnimatePercent >= 100) {
        item.animationList.push(item.list[animationLen]);
        item.segmentAnimatePercent = 0;
        item.segmentAnimateStartTime = now();
      }
    });
    this.isFinishedAnimation = isFinishedAnimation;
    this.drawCanvasBg();
    this.drawTitle();
    this.drawChartBg();
    this.drawAxis();
    this.drawData();
    if (!isFinishedAnimation) {
      this.animationHandle = requestAnimationFrame(this.drawCanvas.bind(this));
    }
  }

  protected drawData(): void {
    if (this.curveList.length <= 0) return;
    this.curveList.map((item, index) => {
      if (!this.ctx) return;
      if (item.animationList.length <= 0) return;

      const curveList = item.animationList;
      const percent = item.segmentAnimatePercent;
      const firstPoint = curveList[0];
      const len = curveList.length;
      const penultimatePoint = curveList[len - 2];
      const lastPoint = curveList[len - 1];
      let lastX = lastPoint.point.x;
      let lastY = lastPoint.point.y;

      const areaLineColor = this.options.areaLineColor || ['rgba(233, 28, 65, 1)'];
      const areaStartColor = this.options.areaStartColor || ['rgba(233, 28, 65, 1)'];
      const areaEndColor = this.options.areaEndColor || ['rgba(246, 60, 118, 0)'];
      this.ctx.save();
      this.ctx.strokeStyle = areaLineColor[index] || areaLineColor[areaLineColor.length - 1];
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = this.areaLineWidth;
      this.ctx.beginPath();

      this.ctx.moveTo(firstPoint.point.x, firstPoint.point.y);

      // ????????????????????????
      for (let i = 1; i < len - 1; i++) {
        const item = curveList[i];
        const previous = curveList[i -1];
        this.ctx.bezierCurveTo(
          previous.control2.x,
          previous.control2.y,
          item.control1.x,
          item.control1.y,
          item.point.x,
          item.point.y
        );
      }

      if (penultimatePoint) {
        if (this.isFinishedAnimation) {
          // ????????????????????????????????????????????? bezierCurveTo ????????????
          this.ctx.bezierCurveTo(
            penultimatePoint.control2.x,
            penultimatePoint.control2.y,
            lastPoint.control1.x,
            lastPoint.control1.y,
            lastPoint.point.x,
            lastPoint.point.y
          );
          lastX = lastPoint.point.x;
          lastY = lastPoint.point.y;
        } else {
          // ???????????????????????????????????????????????????????????????
          for (let t = 0; t <= percent / 100; t += 0.1) {
            lastX = curveWithTime(
              penultimatePoint.point.x,
              penultimatePoint.control2.x,
              lastPoint.control1.x,
              lastPoint.point.x, t
            );
            lastY = curveWithTime(
              penultimatePoint.point.y,
              penultimatePoint.control2.y,
              lastPoint.control1.y,
              lastPoint.point.y, t
            );
            this.ctx.lineTo(lastX, lastY);
          }
        }
      }
      /** ???????????? */
      this.ctx.stroke();

      /** ???????????? */
      const endY = this.chartEndY - this.chartPadding[2]; // padding-bottom;
      const linearGradient = this.ctx.createLinearGradient(0, 0, 0, endY);
      linearGradient.addColorStop(0, areaStartColor[index] || areaStartColor[areaStartColor.length - 1]);
      linearGradient.addColorStop(1, areaEndColor[index] || areaEndColor[areaEndColor.length - 1]);
      this.ctx.lineTo(lastX, lastY);
      this.ctx.lineTo(lastX, endY);
      this.ctx.lineTo(firstPoint.point.x, endY);
      this.ctx.lineTo(firstPoint.point.x, firstPoint.point.y);
      this.ctx.fillStyle = linearGradient;
      this.ctx.fill();

      this.ctx.closePath();
      this.ctx.restore();
    });

    if (this.isFinishedAnimation) {
      this.adsorptionToLast();
      this.drawDot();
    }
  }

  public forceUpdate (options?: AreaOptions) {
    this.init(options);
  }
  public updateData (xAxisData?: string[], yAxisData?: number[][]) {
    if (xAxisData) {
      this.options.xAxisData = xAxisData;
    }
    if (yAxisData) {
      this.options.yAxisData = yAxisData;
    }
    this.initData();
  }

  public destroy(): void {
    if(this.animationHandle) window.cancelAnimationFrame(this.animationHandle);
    if(this.handleMoveTimer) window.clearTimeout(this.handleMoveTimer);
    this.removeEventHandler();
    if(this.canvas) this.el.removeChild(this.canvas);
  }
}
