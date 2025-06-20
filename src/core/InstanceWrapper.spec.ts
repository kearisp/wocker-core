import {describe, it, expect} from "@jest/globals";
import {Container} from "./Container";
import {Injectable} from "../decorators";
import {ModuleWrapper} from "./ModuleWrapper";
import {InstanceWrapper} from "./InstanceWrapper";


describe("InstanceWrapper", (): void => {
    const getContext = () => {
        class ModuleType {}

        const module = new ModuleWrapper(new Container(), ModuleType);

        return {
            module
        };
    };

    it("should create instance wrapper with useValue provider", (): void => {
        const {module} = getContext();

        const PROVIDE = "TEST",
              VALUE = "VALUE";

        module.addProvider({
            provide: PROVIDE,
            useValue: VALUE
        });

        const wrapper = module.getWrapper(PROVIDE);

        expect(wrapper).not.toBeNull();
        expect(wrapper?.instance).toBe(VALUE);
    });

    it("should create instance wrapper with useClass provider", (): void => {
        const {module} = getContext();

        const PROVIDE = "_TEST_";

        class ClassProvider {}

        module.addProvider({
            provide: PROVIDE,
            useClass: ClassProvider
        });

        const wrapper = module.getWrapper(PROVIDE);

        expect(wrapper).not.toBeNull();
        expect(wrapper?.instance).toBeInstanceOf(ClassProvider);
    });

    it("should create instance wrapper with injectable service and its dependencies", (): void => {
        const {module} = getContext();

        @Injectable()
        class TestDependencyService {}

        @Injectable()
        class TestService {
            public constructor(
                protected readonly testDependencyService: TestDependencyService
            ) {}
        }

        module.addProvider(TestService);
        module.addProvider(TestDependencyService);

        const testService = module.getWrapper(TestService);

        expect(testService).not.toBeNull();
        expect(testService?.instance).toBeInstanceOf(TestService);
        expect(testService?.type).toEqual(TestService);
    });

    it("should throw error when type is not defined", (): void => {
        const {module} = getContext();

        const wrapper = new InstanceWrapper(module, {
            provide: "TEST",
            useClass: null as any
        });

        expect(() => wrapper.instance).toThrowError();
    });

    it("should replace existing provider with new one", (): void => {
        const {module} = getContext();

        module.addProvider({
            provide: "TEST",
            useValue: "TEST-1"
        });

        const wrapper = module.getWrapper("TEST");

        expect(wrapper).not.toBeNull();
        expect(wrapper?.instance).toBe("TEST-1");

        module.replace("TEST", {
            provide: "TEST",
            useValue: "TEST-2"
        });

        expect(wrapper?.instance).toBe("TEST-2");
    });

    it("should replace dependency", (): void => {
        @Injectable()
        class TestProvider {}

        @Injectable()
        class Test2Provider {}

        @Injectable()
        class TestParentProvider {
            public constructor(
                public readonly testProvider: TestProvider
            ) {}
        }

        const {module} = getContext();

        module.addProvider(TestProvider);
        module.addProvider(TestParentProvider);

        module.replace(TestProvider, Test2Provider);

        const testParentProvider = module.get(TestParentProvider);

        expect(testParentProvider).toBeInstanceOf(TestParentProvider);
        expect(testParentProvider.testProvider).toBeInstanceOf(Test2Provider);
    });
});
