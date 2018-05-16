import React from "react";
import { render } from "react-dom";
import Hello from "./Hello";
import yolo, { downloadModel } from "tfjs-yolo-tiny";
import WebcamJS from "./webcam.js";
import * as tf from "@tensorflow/tfjs";
import WebCam from "react-webcam";
import "./styles.css";

class App extends React.Component {
  constructor(props) {
    super();
    this.state = {
      boxes: []
    };
    this.main = this.main.bind(this);
    this.run = this.run.bind(this);

    this.webcam = null;
    this.model = null;
    this.webcamEl = null;

    this.intervalTimer = null;
  }

  async main() {
    try {
      this.ga();
      this.model = await downloadModel();
      // await this.webcam2.setup();
      // doneLoading();
      this.run();
    } catch (e) {
      console.error(e);
    }
  }

  async run() {
    const self = this;
    this.intervalTimer = window.setInterval(async () => {
      if (self.webcamEl) {
        const inputImage = this.webcam.capture(this.webcamEl);

        const t0 = performance.now();
        // const boxes = [];
        const boxes = await yolo(inputImage, this.model);

        const t1 = performance.now();
        console.log("YOLO inference took " + (t1 - t0) + " milliseconds.");
        this.setState({
          boxes: boxes.map(box => ({
            ...box,
            text: `${box.className} Confidence: ${Math.round(
              box.classProb * 100
            )}%`
          }))
        });

        boxes.forEach(box => {
          const { top, left, bottom, right, classProb, className } = box;

          console.log(
            left,
            top,
            right - left,
            bottom - top,
            "Confidence:",
            Math.round(classProb * 100)
          );

          // this.drawRect(
          //   left,
          //   top, s
          //   right - left,
          //   bottom - top,
          //   `${className} Confidence: ${Math.round(classProb * 100)}%`
          // );
        });

        await tf.nextFrame();
      }
    }, 200);
    // while (true && this.webcamEl) {
    //   // this.clearRects();

    //   // const inputImage = this.webcam.capture(this.webcamEl);

    //   const t0 = performance.now();
    //   const boxes = [];
    //   // const boxes = await yolo(inputImage, this.model);

    //   const t1 = performance.now();
    //   console.log("YOLO inference took " + (t1 - t0) + " milliseconds.");

    //   boxes.forEach(box => {
    //     const { top, left, bottom, right, classProb, className } = box;

    //     console.log(
    //       left,
    //       top,
    //       right - left,
    //       bottom - top,
    //       "Confidence:",
    //       Math.round(classProb * 100)
    //     );

    //     // drawRect(left, top, right - left, bottom - top,
    //     //   `${className} Confidence: ${Math.round(classProb * 100)}%`)
    //   });

    //   await tf.nextFrame();
    // }
  }

  ga = () => {
    if (process.env.UA) {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", process.env.UA);
    }
  };

  // drawRect = (x, y, w, h, text = "", color = "red") => {
  //   const rect = document.createElement("div");
  //   rect.classList.add("rect");
  //   rect.style.cssText = `top: ${y}; left: ${x}; width: ${w}; height: ${h}; border-color: ${color}`;

  //   const label = document.createElement("div");
  //   label.classList.add("label");
  //   label.innerText = text;
  //   rect.appendChild(label);

  //   this.webCamWrap.appendChild(rect);
  // };

  // clearRects = () => {
  //   const rects = document.getElementsByClassName("rect");
  //   while (rects[0]) {
  //     rects[0].parentNode.removeChild(rects[0]);
  //   }
  // };

  componentDidMount() {
    this.main();
    this.webcamEl = document.getElementsByTagName("video")[0];
    this.webcam = new WebcamJS(this.webcamEl);
    // this.webcam2 = new WebcamJS(this.webcamEl2);
  }
  render() {
    return (
      <div>
        <WebCam height={416} />
        {
          // <video
          //   ref={n => {
          //     this.webcamEl2 = n;
          //   }}
          //   id="webcam"
          //   height={416}
          //   width={416}
          // />
        }
        <div
          className="webcam-wrapper"
          ref={n => {
            this.webCamWrap = n;
          }}
        >
          {this.state.boxes.map(
            ({ top, left, bottom, right, classProb, className, text }) => (
              <div
                className="rect"
                style={{
                  top,
                  left,
                  width: right - left,
                  height: bottom - top,
                  borderColor: "red"
                }}
              >
                <div className="label">{text}</div>
              </div>
            )
          )}
        </div>
        <button
          onClick={() => {
            window.clearInterval(this.intervalTimer);
          }}
        >
          STOP WATCHING
        </button>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
