// src/api/index.ts
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

// ─── Типы ──────────────────────────────────────────────────────────────
export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  secure?: boolean;
  path: string;
  type?: ContentType;
  query?: QueryParamsType;
  format?: ResponseType;
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export const ContentType = {
  Json: "application/json",
  JsonApi: "application/vnd.api+json",
  FormData: "multipart/form-data",
  UrlEncoded: "application/x-www-form-urlencoded",
  Text: "text/plain",
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];

// ─── Типы данных (адаптируй под свой бэкенд) ─────────────────────────
export interface SerializerUserJSON {
  login: string;
  password: string;
  is_moderator?: boolean;
}

export interface SerializerTireJSON {
  tire_id?: number;
  tire_title?: string;
  description?: string;
  photo?: string;
  video?: string;
  tire_material_coefficient?: number;
  tire_thickness_coefficient?: number;
  short_description_en?: string;
  is_delete?: boolean;
}

export interface SerializerTirePressureJSON {
  tire_pressure_id?: number;
  creator_login?: string;
  air_temperature?: number;
  car_weight?: number;
  status?: string;
  date_create?: string;
  date_formed?: string;
  date_completed?: string;
  moderator_login?: string;
  tire_entries_count?: number;
}

export interface SerializerTirePressureEntryJSON {
  id?: number;
  tire_id?: number;
  tire_title?: string;
  pressure?: number;
  coating_coefficient?: number;
  photo?: string;
  tire_material_coefficient?: number;
  tire_thickness_coefficient?: number;
}

export interface SerializerCartJSON {
  tire_pressure_id?: number;
  tires_count?: number;
}

export interface SerializerFinishJSON {
  status: "completed" | "rejected";
}

export interface SerializerTirePressureUpdateJSON {
  air_temperature?: number;
  car_weight?: number;
}

export interface SerializerTirePressureEntryUpdateJSON {
  pressure?: number;
  coating_coefficient?: number;
  direction?: string;
}

// ─── HttpClient (как в примере) ───────────────────────────────────────
export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);
    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    }
    return `${formItem}`;
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) return input;
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];
      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }
      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }
    if (type === ContentType.Text && body && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

// ─── Api (наследуется от HttpClient → api.instance работает!) ─────────
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  
  // 👤 Auth
  users = {
    signinCreate: (credentials: SerializerUserJSON, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/users/signin`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    signoutCreate: (params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/users/signout`,
        method: "POST",
        secure: true,
        ...params,
      }),

    signupCreate: (user: SerializerUserJSON, params: RequestParams = {}) =>
      this.request<SerializerUserJSON, Record<string, string>>({
        path: `/users/signup`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };

  // 🛞 Tires
  tires = {
    tiresList: (query?: { Title?: string }, params: RequestParams = {}) =>
      this.request<SerializerTireJSON[], Record<string, string>>({
        path: `/tires`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    tiresDetail: (id: number, params: RequestParams = {}) =>
      this.request<SerializerTireJSON, Record<string, string>>({
        path: `/tires/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    tiresCreate: (
      data: Partial<SerializerTireJSON> & { photo?: File; video?: File },
      params: RequestParams = {},
    ) =>
      this.request<SerializerTireJSON, Record<string, string>>({
        path: `/tires`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };

  // 📋 Tire Pressure (заявки)
  tirePressure = {
    tirePressureCartList: (params: RequestParams = {}) =>
      this.request<SerializerCartJSON, any>({
        path: `/tire_pressure/tire_pressure-cart`,
        method: "GET",
        format: "json",
        ...params,
      }),

    tirePressuresList: (
      query?: { from_date?: string; to_date?: string; status?: string },
      params: RequestParams = {},
    ) =>
      this.request<SerializerTirePressureJSON[], Record<string, string>>({
        path: `/tire-pressures`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    tirePressuresDetail: (id: number, params: RequestParams = {}) =>
      this.request<
        { application: SerializerTirePressureJSON; entries: SerializerTirePressureEntryJSON[] },
        Record<string, string>
      >({
        path: `/tire-pressures/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    tirePressuresUpdate: (
      id: number,
      body: SerializerTirePressureUpdateJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerTirePressureJSON, Record<string, string>>({
        path: `/tire-pressures/${id}`,
        method: "PUT",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    tirePressuresDelete: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/tire-pressures/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    tirePressuresFormUpdate: (id: number, params: RequestParams = {}) =>
      this.request<SerializerTirePressureJSON, Record<string, string>>({
        path: `/tire-pressures/${id}/form`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    tirePressuresFinishUpdate: (
      id: number,
      body: SerializerFinishJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerTirePressureJSON, Record<string, string>>({
        path: `/tire-pressures/${id}/finish`,
        method: "PUT",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };

  // 🔗 Tire Pressure Entries (шины в заявке)
  tirePressureEntries = {
    add: (tireId: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/tire-pressure-entries/add/${tireId}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    update: (
      tireId: number,
      pressureId: number,
      body: SerializerTirePressureEntryUpdateJSON,
      params: RequestParams = {},
    ) =>
      this.request<SerializerTirePressureEntryJSON, Record<string, string>>({
        path: `/tire-pressure-entries/${tireId}/${pressureId}`,
        method: "PUT",
        body: body,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    delete: (tireId: number, pressureId: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/tire-pressure-entries/${tireId}/${pressureId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}

// ─── Экспорт и настройка интерцепторов ─────────────────────────────────
const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const api = new Api({ baseURL });

// 🔒 Интерцептор запросов: добавляем JWT
api.instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔓 Интерцептор ответов: сохраняем токен при логине
api.instance.interceptors.response.use(
  (response) => {
    const data = response.data;
    const token = data?.access_token ?? data?.token;
    if (token) {
      localStorage.setItem("token", String(token));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  },
);