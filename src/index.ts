import * as fs from "fs";
import dotenv from 'dotenv';
import {Dimensions} from "./interfaces/Dimensions.interface";
import {Generator} from "./classes/Generator.class";
dotenv.config()

const getInputFiles = (): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(process.env.INPUT_FOLDER as string, (err, files) => {
            if (err) reject(err)
            resolve(files)
        })
    })
}

const getCanvasDimensions = (files: string[], singleDimensions: Dimensions): Dimensions => {
    const height = singleDimensions.height * files.length
    return {
        width: singleDimensions.width,
        height: height
    }
}

const divide = (item: any, k: number) => k % 2 === 0

const main = async (argv: string[]): Promise<void> => {
    const singleDimensions: Dimensions = {
        width: parseInt(process.env.IMAGE_WIDTH as string),
        height: parseInt(process.env.IMAGE_HEIGHT as string),
    }

    let files = await getInputFiles()
    for (const arg of argv) {
        if (arg === "--divide" || arg === "-d")
            files = files.filter(divide)
    }
    console.log(`[*] Found ${files.length} files in ${process.env.INPUT_FOLDER}`)
    const dimensions = getCanvasDimensions(files, singleDimensions)
    const generator = new Generator(files, dimensions)
    await generator.createCssSprite(singleDimensions)
}

main(process.argv).then(() => console.log("[*] Done!"))
