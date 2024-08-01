import RNHTMLtoPDF from 'react-native-html-to-pdf';

export const convertImageToPdf = async (imageUri) => {
  const options = {
    html: `<img src="${imageUri}" style="width: 100%; height: auto;">`,
    fileName: 'ImagePDF',
    directory: 'Documents',
  };

  try {
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error) {
    console.error("Error converting image to PDF: ", error);
    throw error;
  }
};
