import "./src/ServicesRegistry";

jest.mock("./src/services/StorageService");
jest.mock("./src/services/HttpService");
jest.mock("./src/services/DynamoDBService");
