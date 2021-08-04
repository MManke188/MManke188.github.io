// Global variables

var dimensions;
var scalarData = [];
var dataRange = [0, 1];

var renderWindow;
var actor;
var ctfun;
var ofun;

// This function reads the contents of a .vti file and initializes a
// volume renderer.  The base transfer function is empty.

function initializeVR(fileContents) {
  let rootContainer = document.getElementById("volren");
  rootContainer.style.float = "left";
  rootContainer.style.width = "500px";
  rootContainer.style.height = "500px";

  while (rootContainer.children.length > 0) {
    rootContainer.children[0].remove();
  }

  let genericRenderWindow = vtk.Rendering.Misc.vtkGenericRenderWindow.newInstance();
  genericRenderWindow.setContainer(rootContainer);
  genericRenderWindow.setBackground([0, 0, 0]);
  genericRenderWindow.resize();

  let renderer = genericRenderWindow.getRenderer();
  renderWindow = genericRenderWindow.getRenderWindow();

  let reader = vtk.IO.XML.vtkXMLImageDataReader.newInstance();
  reader.parseAsArrayBuffer(fileContents);

  image = reader.getOutputData();
  dimensions = image.getDimensions();
  scalarData = image.getPointData().getScalars().getData();
  dataRange = image.getPointData().getScalars().getRange();


  actor = vtk.Rendering.Core.vtkVolume.newInstance();
  let mapper = vtk.Rendering.Core.vtkVolumeMapper.newInstance();
  mapper.setSampleDistance(1);
  actor.setMapper(mapper);

  // create color and opacity transfer functions
  ctfun = vtk.Rendering.Core.vtkColorTransferFunction.newInstance();
  ofun = vtk.Common.DataModel.vtkPiecewiseFunction.newInstance();
  actor.getProperty().setRGBTransferFunction(0, ctfun);
  actor.getProperty().setScalarOpacity(0, ofun);
  actor.getProperty().setScalarOpacityUnitDistance(0, 0.5);
  actor.getProperty().setInterpolationTypeToLinear();
  actor.getProperty().setUseGradientOpacity(0, true);
  actor.getProperty().setGradientOpacityMinimumValue(0, 0);
  actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
  actor.getProperty().setGradientOpacityMaximumValue(0, (dataRange[1] - dataRange[0]) * 0.05);
  actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
  actor.getProperty().setShade(true);
  actor.getProperty().setAmbient(0.2);
  actor.getProperty().setDiffuse(0.7);
  actor.getProperty().setSpecular(0.3);
  actor.getProperty().setSpecularPower(8.0);

  mapper.setInputConnection(reader.getOutputPort());

  renderer.addVolume(actor);

  let interactor = renderWindow.getInteractor();
  interactor.setDesiredUpdateRate(15.0);
  interactor.start();

  renderer.resetCamera();
  renderer.getActiveCamera().zoom(1.5);
  renderer.getActiveCamera().elevation(70);

  renderer.updateLightGeometry();
}


function updateVR(colorPts, opacityPts, categorical) {
  ctfun.removeAllPoints();
  ofun.removeAllPoints();

  colorPts.forEach(function (c) {
    ctfun.addRGBPoint(c[0], c[1].r / 255.0, c[1].g / 255.0, c[1].b / 255.0);
  });

  if (categorical !== undefined) {
    if (categorical) {
      ctfun.setDiscretize(true);
      ctfun.setNumberOfValues(colorPts.length);
    } else {
      ctfun.setDiscretize(false);
    }
  }

  opacityPts.forEach(function (o) {
    ofun.addPoint(o[0], o[1]);
  });

  actor.getProperty().setRGBTransferFunction(0, ctfun);
  actor.getProperty().setScalarOpacity(0, ofun);
  renderWindow.render();
}


