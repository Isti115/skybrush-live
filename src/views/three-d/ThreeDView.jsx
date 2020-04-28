/**
 * @file Component that shows a three-dimensional view of the drone flock.
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import CoordinateSystemAxes from './CoordinateSystemAxes';
import HomePositionMarkers from './HomePositionMarkers';
import LandingPositionMarkers from './LandingPositionMarkers';
import Scenery from './Scenery';

// eslint-disable-next-line no-unused-vars
import AFrame from '~/aframe';
import { objectToString } from '~/aframe/utils';
import Colors from '~/components/colors';
import { isMapCoordinateSystemLeftHanded } from '~/selectors/map';

const images = {
  glow: require('~/../assets/img/sphere-glow-hollow.png').default,
};

const ThreeDView = React.forwardRef((props, ref) => {
  const {
    grid,
    isCoordinateSystemLeftHanded,
    navigation,
    sceneId,
    scenery,
    showAxes,
    showHomePositions,
    showLandingPositions,
    showStatistics,
  } = props;

  const extraCameraProps = {
    'altitude-control': objectToString({
      enabled: true,
    }),
    'better-wasd-controls': objectToString({
      fly: navigation && navigation.mode === 'fly',
    }),
    'wasd-controls': objectToString({
      enabled: false,
    }),
  };
  const extraSceneProps = {};

  if (showStatistics) {
    extraSceneProps.stats = 'true';
  }

  return (
    <a-scene
      key={sceneId}
      ref={ref}
      deallocate
      embedded='true'
      keyboard-shortcuts='enterVR: false'
      loading-screen='backgroundColor: #444; dotsColor: #888'
      renderer='antialias: false'
      vr-mode-ui='enabled: false'
      device-orientation-permission-ui='enabled: false'
      {...extraSceneProps}
    >
      <a-assets>
        <img crossOrigin='anonymous' id='glow-texture' src={images.glow} />

        <a-mixin
          id='takeoff-marker'
          geometry='primitive: triangle; vertexA: 1 0 0; vertexB: -0.5 0.866 0; vertexC: -0.5 -0.866 0'
          material={`shader: flat; color: ${Colors.takeoffMarker}`}
        />
        <a-mixin
          id='landing-marker'
          geometry='primitive: triangle; vertexA: -1 0 0; vertexB: 0.5 -0.866 0; vertexC: 0.5 0.866 0'
          material={`shader: flat; color: ${Colors.landingMarker}`}
        />
      </a-assets>

      <a-camera
        sync-pose-with-store=''
        id='three-d-camera'
        look-controls='reverseMouseDrag: true'
        {...extraCameraProps}
      >
        <a-entity
          cursor='rayOrigin: mouse'
          raycaster='objects: .three-d-clickable; interval: 100'
        />
      </a-camera>

      <a-entity rotation='-90 0 90'>
        {showAxes && (
          <CoordinateSystemAxes leftHanded={isCoordinateSystemLeftHanded} />
        )}
        {showHomePositions && <HomePositionMarkers />}
        {showLandingPositions && <LandingPositionMarkers />}

        <a-drone-flock />
      </a-entity>

      {/* Move the floor slightly down to ensure that the coordinate axes are nicely visible */}
      <Scenery scale={10} type={scenery} grid={grid} />
    </a-scene>
  );
});

ThreeDView.propTypes = {
  grid: PropTypes.string,
  isCoordinateSystemLeftHanded: PropTypes.bool,
  navigation: PropTypes.shape({
    mode: PropTypes.oneOf(['walk', 'fly']),
    parameters: PropTypes.object,
  }),
  scenery: PropTypes.string,
  showAxes: PropTypes.bool,
  showHomePositions: PropTypes.bool,
  showLandingPositions: PropTypes.bool,
  showStatistics: PropTypes.bool,
};

export default connect(
  // mapStateToProps
  (state) => ({
    isCoordinateSystemLeftHanded: isMapCoordinateSystemLeftHanded(state),
    ...state.settings.threeD,
    ...state.threeD,
  }),
  // mapDispatchToProps
  {},
  // mergeProps
  null,
  { forwardRef: true }
)(ThreeDView);
