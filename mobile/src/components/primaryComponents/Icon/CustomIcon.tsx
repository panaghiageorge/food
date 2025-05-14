import React, { Component } from 'react';
import { Image, StyleSheet, ImageSourcePropType } from 'react-native';

type Props = {
    image: ImageSourcePropType;  // Folosim ImageSourcePropType pentru a suporta diverse formate de imagine
    style: any;
    size: number;
    sizeOffset: number;
};

type State = {
    width: number;
    size: number;
};

export default class CustomIcon extends Component<Props, State> {
    static defaultProps = {
        style: {},
        size: 28,
        sizeOffset: 3,
    };

    constructor(props: Props) {
        super(props);

        const size = props.size <= props.sizeOffset ? 1 : props.size - props.sizeOffset;

        this.state = {
            width: props.size,
            size,
        };
    }

    componentDidMount() {
        const imageSource = Image.resolveAssetSource(this.props.image);

        if (imageSource && imageSource.width && imageSource.height) {
            this.setState({
                width: Math.round(this.state.size * imageSource.width / imageSource.height),
            });
        }
    }

    render() {
        const { style } = this.props;
        const currentStyle = {
            resizeMode: 'contain',
            width: this.state.width,
            height: this.state.size,
        };

        return (
            <Image
                source={this.props.image}
                style={[styles.iconStyle, currentStyle, style]}
            />
        );
    }
}

const styles = StyleSheet.create({
    iconStyle: {},
});
