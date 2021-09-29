declare namespace _default {
    const block: ({
        model: string;
        view: string;
        modelSchema?: undefined;
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        modelSchema: {
            allowChildren: string;
            allowIn: string[];
            isBlock: boolean;
            inheritAllFrom?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        view?: undefined;
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            inheritAllFrom: string;
            allowChildren?: undefined;
            allowIn?: undefined;
            isBlock?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            allowIn: string[];
            isBlock: boolean;
            allowChildren?: undefined;
            inheritAllFrom?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            allowIn: string;
            isBlock: boolean;
            allowChildren?: undefined;
            inheritAllFrom?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            allowIn: string;
            allowChildren: string;
            isBlock: boolean;
            inheritAllFrom?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            allowIn: string;
            allowChildren: string[];
            isBlock: boolean;
            inheritAllFrom?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            inheritAllFrom: string;
            isBlock: boolean;
            allowChildren?: undefined;
            allowIn?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        paragraphLikeModel: string;
        modelSchema: {
            inheritAllFrom: string;
            allowChildren?: undefined;
            allowIn?: undefined;
            isBlock?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            allowIn: string;
            allowChildren: string;
            isBlock?: undefined;
            inheritAllFrom?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            allowChildren: string[];
            isBlock: boolean;
            allowIn?: undefined;
            inheritAllFrom?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        modelSchema: {
            allowWhere: string;
            allowChildren: string[];
            isBlock: boolean;
            allowIn?: undefined;
            inheritAllFrom?: undefined;
            isObject?: undefined;
        };
        view?: undefined;
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            allowIn: string[];
            allowChildren: string[];
            isBlock: boolean;
            inheritAllFrom?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        view: string;
        modelSchema: {
            allowChildren: string;
            isBlock: boolean;
            allowIn?: undefined;
            inheritAllFrom?: undefined;
            allowWhere?: undefined;
            isObject?: undefined;
        };
        paragraphLikeModel?: undefined;
        isObject?: undefined;
    } | {
        model: string;
        isObject: boolean;
        modelSchema: {
            isObject: boolean;
            isBlock: boolean;
            allowWhere: string;
            allowChildren?: undefined;
            allowIn?: undefined;
            inheritAllFrom?: undefined;
        };
        view?: undefined;
        paragraphLikeModel?: undefined;
    })[];
    const inline: ({
        model: string;
        view: string;
        attributeProperties: {
            copyOnEnter: boolean;
        };
        priority?: undefined;
        isObject?: undefined;
        modelSchema?: undefined;
    } | {
        model: string;
        view: string;
        priority: number;
        attributeProperties: {
            copyOnEnter: boolean;
        };
        isObject?: undefined;
        modelSchema?: undefined;
    } | {
        model: string;
        isObject: boolean;
        modelSchema: {
            isObject: boolean;
            isInline: boolean;
            allowWhere: string;
            allowAttributesOf: string;
            inheritAllFrom?: undefined;
        };
        view?: undefined;
        attributeProperties?: undefined;
        priority?: undefined;
    } | {
        model: string;
        view: string;
        isObject: boolean;
        modelSchema: {
            inheritAllFrom: string;
            isObject?: undefined;
            isInline?: undefined;
            allowWhere?: undefined;
            allowAttributesOf?: undefined;
        };
        attributeProperties?: undefined;
        priority?: undefined;
    })[];
}
export default _default;
