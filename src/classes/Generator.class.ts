import {Canvas, createCanvas, CanvasRenderingContext2D, loadImage} from "canvas";
import {Dimensions} from "../interfaces/Dimensions.interface";
import * as fs from "fs";
var colors = require('colors');

export class Generator {

    canvas: Canvas | undefined
    ctx: CanvasRenderingContext2D | undefined
    files: string[]

    pastedImages: number = 0

    constructor(files: string[], dimensions: Dimensions, ) {
        this.canvas = createCanvas(dimensions.width, dimensions.height)
        this.ctx = this.canvas.getContext('2d')
        this.files = files
        console.log(`[*] Created canvas with ${dimensions.width}px width and ${dimensions.height}px height`)
    }

    async createCssSprite(singleDimensions: Dimensions) {
        while (this.pastedImages < this.files.length) {
            await this.pasteImage(singleDimensions, this.files[this.pastedImages], this.pastedImages)
            this.printProgressBar(this.pastedImages, this.files.length)
            this.pastedImages ++
        }
        await this.saveCssSprite()
    }

    pasteImage (singleDimensions: Dimensions, filename: string, iteration: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (!this.canvas || !this.ctx) reject ()

            const image = await loadImage(`${process.env.INPUT_FOLDER}/${filename}`)
            this.ctx?.drawImage(image, 0, singleDimensions.height * iteration,
                singleDimensions.width, singleDimensions.height)

            resolve ()
        })
    }

    async saveCssSprite(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const name = (process.env.OUTPUT_FOLDER as string) + "/output-" + Date.now() + ".png"
            const out = fs.createWriteStream(name)
            const stream = this.canvas?.createPNGStream()

            stream?.pipe(out)

            out.on('finish', () => {
                console.log(`[*] Saved file at : ${name}`)
                resolve ()
            })
            out.on('error', reject)
        })
    }

    printProgressBar (pastedImages: number, totalImages: number, barNumber: number = 20): void {
        const percent = pastedImages / totalImages * 100

        let bar = `[*] ${percent.toFixed(2)}% `
        for (let index = 0; index < barNumber; index ++) {
            if (percent > index / barNumber * 100) {
                bar += colors.green("■")
            } else {
                bar += colors.gray("■")
            }
        }
        bar += "\r"
        process.stdout.write(bar)
    }
}
