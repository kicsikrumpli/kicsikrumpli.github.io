# Spring Bean Configuration

Circumstances may bring that the static xml configuration of Spring beans does not suffice. One reason might be our desire to eliminate xml configuration altogether. To create beans of the same type with different configuration there is the possibility to create configuration classes.

## @Configuration

The annotation '@Configuration tells Spring that this particular class may contain methods, that produce spring beans. These methods are annotated with '@Bean, as is shown in the example below:

			@Configuration
			public class ConfigurationClass {
				@Bean
				public SomeInterface beanTypeA() {
					return new BeanTypeA(CONFIG_OPTION_A);
				}
				
				@Bean
				public SomeInterface beanTypeB() {
					return new BeanTypeB(CONFIG_OPTION_B);
				}
			}
			
In the example it is assumed that the inteface SomeInterface is implemented by the classes BeanTypeA and BeanTypeB. To refer to these beans we can use the annotaion '@Qualifier, like so:

			@Service
			public class SomeService {
				@Qualifier("beanTypeA")
				@Autowired
				private SomeInterface someInterfaceBean;
			...
			}

NB! To declare scope use @Scope annotation in conjunction with @Bean.
			
## Provider interface

The solution with configuration classes might not be the best solution for some cases. The reason for this is that instances are created with the 'new operator, hence autowiring does not work in such classes. We could either inject such dependencies through setter or constructor injection, or use the Provider<?> interface as defined by JSR-330. In order fot this to work we need to include javax.inject in the project by adding the dependency

			<dependency>
				<groupId>javax.inject</groupId>
				<artifactId>javax.inject</artifactId>
				<version>1</version>
			</dependency>
			
to pom.xml.

The provider class will be able to hand out dynamically configured prototype scoped beans on demand. For that we could build a structure akin to

			@Component
			public class SomeBeanProvider {
				private Provider<SomeBean> provider;
				
				public SomeBean getInstance() {
					return provider.get();
				}
			}
			
To get hold of an instance of SomeBean in a client class we need to use its provider class as:

			@Component
			public class Client {
				@Autowired
				private SomeBeanProvider someBeanProvider;
				
				public SomeBean client() {
					SomeBean someBean = someBeanProvider.getInstance();
					...
					return someBean;
				}
				...
			}

NB! the Spring specific alternative to Provider<?> interface is ObjectFactory<?> which can be either @Autowired or with an xml-based configuration requires ObjectFactoryCreatingFactoryBean to be configured. Example from Spring documentation:

			<beans>
			   <!-- Prototype bean since we have state -->
			   <bean id="myService" class="a.b.c.MyService" scope="prototype"/>
			   <bean id="myServiceFactory"
			       class="org.springframework.beans.factory.config.ObjectFactoryCreatingFactoryBean">
			     <property name="targetBeanName"><idref local="myService"/></property>
			   </bean>
			   <bean id="clientBean" class="a.b.c.MyClientBean">
			     <property name="myServiceFactory" ref="myServiceFactory"/>
			   </bean>
			</beans>

			...
			
			package a.b.c;
			
			import org.springframework.beans.factory.ObjectFactory;
			
			public class MyClientBean {
			
			   private ObjectFactory<MyService> myServiceFactory;
			
			   public void setMyServiceFactory(ObjectFactory<MyService> myServiceFactory) {
			     this.myServiceFactory = myServiceFactory;
			   }
			
			   public void someBusinessMethod() {
			     // get a 'fresh', brand new MyService instance
			     MyService service = this.myServiceFactory.getObject();
			     // use the service object to effect the business logic...
			   }
			}

source: http://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/beans/factory/config/ObjectFactoryCreatingFactoryBean.html

### idref vs. ref
- `idref` passes reference to bean name
- `ref` passes reference to bean instance

## Lookup-method

http://www.nurkiewicz.com/2010/08/creating-prototype-spring-beans-on.html

