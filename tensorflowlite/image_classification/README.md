# image classification test

Object classification using Camera. The detected object's name is displayed.

## Fetch model file

Download `efficientnet_lite0.tflite` file from google into `data` folder

```
./download.sh
```

## Run

```
./run.sh
# or
python3 classify.py \
--model ./data/efficientnet_lite0.tflite
```

## Reference

- https://github.com/tensorflow/examples/tree/master/lite/examples/image_classification/raspberry_pi
