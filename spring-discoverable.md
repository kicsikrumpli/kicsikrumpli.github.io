Discoverable services with Spring
---

I am currently tasked with refactoring an internal tool that collects information from various data sources. They all have their own format, each is processed differently, and the result is presented in a web-application. Problem with the code base is that it has grown organically from very simple requirements; it has evolved into the kitchen sink being thrown at it. It has a god-method responsible from polling a plethora of services, all of which have their quirky, slightly different interfaces. This results in a long method of a spaghetti of similar method calls.

Instead of a laundry list of @Autowired services it would be beneficial to define a common interface, and have Spring discover them and put them in a collection of services. The benefit is two-fold: we get rod of the monstrously long spaghetti-method, and we further loosen the coupling between components.

This is a very basic prototype to demonstrate the principle:

#Main.java

		@Component
		public class Main {
			
			@Autowired
			private List<DiscoverableService> serviceList;
			private static ApplicationContext ctx;
			
			public static void main(String[] args) {
				ctx = new AnnotationConfigApplicationContext(SpringConfig.class);
				Main main = ctx.getBean(Main.class);
				main.go();
			}

			private void go() {
				for(DiscoverableService service : serviceList) {
					service.ping();
				}
				
			}

		}

#SpringConfig.java

		@Configuration
		@ComponentScan(basePackages = {"service.discovery.test"})
		public class SpringConfig {
		}

#DiscoverableService.java

		public interface DiscoverableService {
			public void ping();
		}

#ServiceA.java

		@Service
		public class ServiceA implements DiscoverableService {
			private Logger logger = LoggerFactory.getLogger(ServiceA.class);

			@Override
			public void ping() {
				logger.info("A");
			}
		}

#ServiceB.java

		@Service
		public class ServiceB implements DiscoverableService {
			private Logger logger = LoggerFactory.getLogger(ServiceB.class);

			@Override
			public void ping() {
				logger.info("B");
			}
		}
