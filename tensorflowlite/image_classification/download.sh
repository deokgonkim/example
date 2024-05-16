DATA_DIR='./data'

# Download TF Lite model with metadata.
FILE=${DATA_DIR}/efficientnet_lite0.tflite
if [ ! -f "$FILE" ]; then
  curl \
    -L 'https://storage.googleapis.com/download.tensorflow.org/models/tflite/task_library/image_classification/rpi/lite-model_efficientnet_lite0_uint8_2.tflite' \
    -o ${FILE}
fi

FILE=${DATA_DIR}/efficientnet_lite0_edgetpu.tflite
if [ ! -f "$FILE" ]; then
  curl \
    -L 'https://storage.googleapis.com/download.tensorflow.org/models/tflite/task_library/image_classification/rpi/efficientnet_lite0_edgetpu.tflite' \
    -o ${FILE}
fi
echo -e "Downloaded files are in ${DATA_DIR}"
