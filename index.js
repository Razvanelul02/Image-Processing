const imageElement = document.getElementById("img--initial");
imageElement.crossOrigin = "anonymous";

const canvasElement = document.getElementById("canvas");
canvasElement.width = imageElement.width;
canvasElement.height = imageElement.height;

const canvas = canvasElement.getContext("2d");

const fetchImage = async () => {
  const response = await fetch("https://picsum.photos/300/300");

  if (response.status === 200) {
    imageElement.src = response.url;
    imageElement.onload = () => {
      canvas.drawImage(imageElement, 0, 0);
    };
  }
};

fetchImage();

// o functie ce inglobeaza setTimout pentru a putea fi folosit cu async await
const timeout = (delay) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const sleep = async (delay) => {
  await timeout(delay);
};

const showPartialImage = (imgData, height, width) => {
  const newImage = new ImageData(width, height);
  const newData = newImage.data;

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width * 4; j += 4) {
      newData[i * width * 4 + j] = imgData[i * width * 4 + j];
      newData[i * width * 4 + j + 1] = imgData[i * width * 4 + j + 1];
      newData[i * width * 4 + j + 2] = imgData[i * width * 4 + j + 2];
      newData[i * width * 4 + j + 3] = imgData[i * width * 4 + j + 3];
    }
  }
  return newImage;
};

const mirrorImage = (imgData, width, height) => {
  const newImage = new ImageData(width, height);
  const newData = newImage.data;

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width * 4; j += 4) {
      newData[i * width * 4 + j] = imgData[i * width * 4 + width * 4 - j - 4];
      newData[i * width * 4 + j + 1] =
        imgData[i * width * 4 + width * 4 - j - 3];
      newData[i * width * 4 + j + 2] =
        imgData[i * width * 4 + width * 4 - j - 2];
      newData[i * width * 4 + j + 3] =
        imgData[i * width * 4 + width * 4 - j - 1];
    }
  }

  return newImage;
};

const toGrayScale = (imgData, width, height) => {
  const newImage = new ImageData(width, height);
  const newData = newImage.data;
  const length = width * height * 4;

  for (let i = 0; i < length; i += 4) {
    let avg = parseInt((imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3);

    newData[i] = avg;
    newData[i + 1] = avg;
    newData[i + 2] = avg;
    newData[i + 3] = imgData[i + 3];
  }

  return newImage;
};

const slowProcessing = async (imageData, delay) => {
  let delayCount = 1;
  const sliceLength = canvasElement.height / 4;
  while (delayCount <= 4) {
    let partialImage = showPartialImage(
      imageData,
      sliceLength * delayCount,
      canvasElement.width
    );
    canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvas.putImageData(partialImage, 0, 0);
    await sleep(delay);
    delayCount++;
  }
};

const onMirror = async () => {
  const imageData = canvas.getImageData(
    0,
    0,
    canvasElement.width,
    canvasElement.height
  ).data;

  let start = Date.now();

  const mirroredImg = mirrorImage(
    imageData,
    canvasElement.width,
    canvasElement.height
  );

  let end = Date.now();
  console.log(`Timp executie pentru mirror: ${end - start} ms`);
  await slowProcessing(mirroredImg.data, 1000); // incetinim fictiv procesarea imaginii, desi ea se realizeaza la pasul anterior

  start = Date.now();

  const grayscaledImg = toGrayScale(
    mirroredImg.data,
    canvasElement.width,
    canvasElement.height
  );

  end = Date.now();
  console.log(`Timp executie pentru grayscale: ${end - start} ms`);
  await slowProcessing(grayscaledImg.data, 1000);
};
