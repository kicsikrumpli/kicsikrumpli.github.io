# Spring AOP

## Dependencies:
    <dependency>
      <groupId>org.aspectj</groupId>
      <artifactId>aspectjrt</artifactId>
      <version>1.8.4</version>
    </dependency>
    <dependency>
      <groupId>org.aspectj</groupId>
      <artifactId>aspectjweaver</artifactId>
      <version>1.8.4</version>
    </dependency>
    <dependency>
      <groupId>cglib</groupId>
      <artifactId>cglib</artifactId>
      <version>3.1</version>
    </dependency>

## Config
servlet-context.xml
<?xml version="1.0" encoding="UTF-8"?>
<beans:beans
      xmlns:beans="http://www.springframework.org/schema/beans"
      xmlns:aop="http://www.springframework.org/schema/aop"
      xsi:schemaLocation="http://www.springframework.org/schema/aop
        http://www.springframework.org/schema/aop/spring-aop-3.1.xsd
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">
        
      ...

      <context:component-scan base-package="com.epam.foo" />
      <aop:aspectj-autoproxy />

## Example
### Custom annotation
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    public @interface Foo {

    }

### Aspect around custom annotation
    @Aspect
    @Component
    public class FooAspect {
    	private static final Logger LOGGER = LoggerFactory.getLogger(FooAspect.class);

    	@Around(value = "@annotation(Foo)")
    	public Object foo(ProceedingJoinPoint pjp) throws Throwable {
    		LOGGER.info("### before");
    		Object retVal = pjp.proceed();
    		LOGGER.info("### after");
    		return retVal;
    	}
    }

### Weaved method
    @Controller
    public class HomeController {

    	private static final Logger logger = LoggerFactory.getLogger(HomeController.class);

    	/**
    	 * Simply selects the home view to render by returning its name.
    	 */
    	@Foo
    	@RequestMapping(value = "/", method = RequestMethod.GET)
    	public String home(Locale locale, Model model) {
    		logger.info("Welcome home! The client locale is {}.", locale);

    		Date date = new Date();
    		DateFormat dateFormat = DateFormat.getDateTimeInstance(DateFormat.LONG, DateFormat.LONG, locale);

    		String formattedDate = dateFormat.format(date);

    		model.addAttribute("serverTime", formattedDate );

    		return "home";
    	}

    }
