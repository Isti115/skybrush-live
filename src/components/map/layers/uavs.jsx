import { layer } from 'ol-react'
import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import u from 'updeep'

import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'

import { colorPredicates } from '../features/UAVFeature'
import ActiveUAVsLayerSource from '../sources/ActiveUAVsLayerSource'

import { setLayerParameterById } from '../../../actions/layers'
import { showSnackbarMessage } from '../../../actions/snackbar'
import flock from '../../../flock'
import { getSelection } from '../../../selectors'
import { updateUAVFeatureColorsSignal } from '../../../signals'
import { coordinateFromLonLat } from '../../../utils/geography'
import * as logging from '../../../utils/logging'

const colors = ['pink', 'orange', 'yellow', 'green', 'blue', 'purple']

const updatePredicates = (predicates, errorHandler) => {
  for (const color in predicates) {
    try {
      /* eslint no-new-func: "off" */
      colorPredicates[color] = new Function('id', `return ${predicates[color]}`)
    } catch (e) {
      errorHandler(`Invalid color predicate for ${color} --> ${e}`)
    }
  }
}

// === Settings for this particular layer type ===

class UAVsLayerSettingsPresentation extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      colorPredicates: props.layer.parameters.colorPredicates
    }

    this._makeChangeHandler = this._makeChangeHandler.bind(this)
    this._handleClick = this._handleClick.bind(this)
  }

  render () {
    const colorInputs = colors.map(color => (
      <TextField
        style={{ marginTop: '-20px', fontFamily: 'monospace' }}
        key={`${color}_predicate_textfield`}
        name={`${color}_predicate_textfield`}
        floatingLabelText={color}
        value={this.state.colorPredicates[color]}
        onChange={this._makeChangeHandler(color)} />
    ))
    return (
      <div>
        <p key="header">
          Color predicates (e.g. <code>id.includes(&apos;1&apos;)</code>)
        </p>
        {colorInputs}
        <br />
        <Button raised onClick={this._handleClick}>Apply</Button>
      </div>
    )
  }

  componentWillReceiveProps (newProps) {
    updatePredicates(
      newProps.layer.parameters.colorPredicates,
      this.props.showMessage
    )
    updateUAVFeatureColorsSignal.dispatch()
  }

  _makeChangeHandler (color) {
    return (event) => {
      this.setState(
        u.updateIn(`colorPredicates.${color}`, event.target.value, this.state)
      )
    }
  }

  _handleClick () {
    this.props.setLayerParameter('colorPredicates', this.state.colorPredicates)
  }
}

UAVsLayerSettingsPresentation.propTypes = {
  layer: PropTypes.object,
  layerId: PropTypes.string,

  setLayerParameter: PropTypes.func,
  showMessage: PropTypes.func
}

export const UAVsLayerSettings = connect(
  // mapStateToProps
  (state, ownProps) => ({}),
  // mapDispatchToProps
  (dispatch, ownProps) => ({
    setLayerParameter: (parameter, value) => {
      dispatch(setLayerParameterById(ownProps.layerId, parameter, value))
    },
    showMessage: (message) => {
      dispatch(showSnackbarMessage(message))
    }
  })
)(UAVsLayerSettingsPresentation)

// === The actual layer to be rendered ===

class UAVsLayerPresentation extends React.Component {
  render () {
    return (
      <layer.Vector updateWhileAnimating updateWhileInteracting
        zIndex={this.props.zIndex}>

        <ActiveUAVsLayerSource
          selection={this.props.selection}
          flock={flock}
          projection={this.props.projection} />

      </layer.Vector>
    )
  }

  componentWillReceiveProps (newProps) {
    updatePredicates(
      newProps.layer.parameters.colorPredicates,
      logging.addErrorItem
    )
  }
}

UAVsLayerPresentation.propTypes = {
  layer: PropTypes.object,
  layerId: PropTypes.string,
  zIndex: PropTypes.number,

  selection: PropTypes.arrayOf(PropTypes.string).isRequired,
  projection: PropTypes.func.isRequired
}

UAVsLayerPresentation.defaultProps = {
  projection: coordinateFromLonLat
}

export const UAVsLayer = connect(
  // mapStateToProps
  (state, ownProps) => ({
    selection: getSelection(state)
  }),
  // mapDispatchToProps
  (dispatch, ownProps) => ({})
)(UAVsLayerPresentation)
