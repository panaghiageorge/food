import * as React from 'react';
import { Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import icons from './icons';  // Iconele tale personalizate
import CustomIcon from "./CustomIcon";

export type IconProps = {
    name: string;
    size: number;
    color: string;
    style: any;
};

type State = {
    config: any;
};

export default class Icon extends React.Component<IconProps, State> {
    static defaultProps = {
        name: '',
        size: 28,
        color: 'black',
        style: {},
    };

    state: State = {
        config: null,
    };

    resolveIcon = (key: string): any => {
        // Verificăm dacă există configurația pentru iconul dat
        if (!icons[key]) {
            // Dacă nu există, folosim Ionicons ca fallback
            return {
                font: 'Ionicons',
                fontComponent: Ionicons,
                name: key.startsWith('ios-') || key.startsWith('md-') ? key : Platform.OS === 'ios' ? `ios-${key}` : `md-${key}`,
            };
        }

        let config = icons[key];
        let fontComponent = null;

        // Verificăm pentru platformă, pentru a selecta configurarea corectă
        if (typeof config.android === 'undefined' || typeof config.ios === 'undefined') {
            config = icons[key]; // Configurare pe platformă unică
        } else {
            config = Platform.select(config); // Selectăm configurarea pentru platformă
        }

        // Dacă avem o imagine personalizată
        if (config.image) {
            config.isCustom = true;
            return config;
        }

        // Determinăm fontul iconiței pe baza configurației
        switch (config.font) {
            case 'Ionicons':
                fontComponent = Ionicons;
                break;
            case 'MaterialCommunityIcons':
                fontComponent = MaterialCommunityIcons;
                break;
            case 'FontAwesome':
                fontComponent = FontAwesome;
                break;
            case 'FontAwesome5':
                fontComponent = FontAwesome5;
                break;
            case 'Entypo':
                fontComponent = Entypo;
                break;
            case 'Feather':
                fontComponent = Feather;
                break;
            case 'MaterialIcons':
                fontComponent = MaterialIcons;
                break;
            case 'SimpleLineIcons':
                fontComponent = SimpleLineIcons;
                break;
            case 'AntDesign':
                fontComponent = AntDesign;
                break;
            case 'EvilIcons':
                fontComponent = EvilIcons;
                break;
            default:
                fontComponent = Ionicons; // Fallback implicit
        }

        config.fontComponent = fontComponent;
        config.isCustom = false;

        return config;
    };

    componentDidMount(): void {
        this.init(this.props.name);
    }

    componentDidUpdate(prevProps: IconProps): void {
        if (prevProps.name !== this.props.name) {
            this.init(this.props.name);
        }
    }

    init = (name: string): void => {
        const config = this.resolveIcon(name);
        this.setState({ config });
    };

    render(): JSX.Element | null {
        const { config } = this.state;

        if (!config) {
            return null;
        }

        if (config.isCustom) {
            return <CustomIcon image={config.image} size={this.props.size} style={this.props.style} />;
        }

        const IconComponent = config.fontComponent;

        return (
            <IconComponent
                name={config.name}
                size={this.props.size}
                color={this.props.color}
                style={this.props.style}
            />
        );
    }
}
