import * as tf from '@tensorflow/tfjs-node'
import jpeg from 'jpeg-js'
import { predictionType } from 'nsfwjs'

export const convert = (img: Buffer) => {
  // Decoded image in UInt8 Byte array
  const image = jpeg.decode(img, { useTArray: true })

  const numChannels = 3
  const numPixels = image.width * image.height
  const values = new Int32Array(numPixels * numChannels)

  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c]

  return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
}

const minNeutral = 0.3
const maxPorn = 0.08

const find = (predictions: [predictionType], name: string) => (
  predictions.find(({ className }: predictionType) => className === name)!.probability
)

export const isSafe = (predictions: [predictionType]) => {
  return find(predictions, "Porn") < maxPorn && find(predictions, 'Neutral') > minNeutral
}
