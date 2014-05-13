Multiple Property Files with Spring
===

The goal is to be able to inject values with the annotation.

		@Value("${property.name})
		private String someValueFromConfig;
	
In order to do that, one must register a PropertyPlaceholderConfigurer bean with the spring container. This works almost automagically, until the need for multiple property files arises.

One would think it is enough to register a second instance of the PropertyPlaceholderConfigurer with another property file. Seems logical enough since according to the documentation there is no restriction on the number of such beans. Unfortunately this is not the case. When the Spring Expression Language (SPEL) string inside @Value annotation cannot be resolved with the property file declared first, an exception is thrown. We have thrown a monkey wrench into the bean creation process. 

To resolve this, we must tell Spring to move on. This can be achieved with the p:ignoreUnresolvablePlaceholders property.

		<util:properties id="applicationProps" location="WEB-INF/spring/config.properties" />
		<bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer" 
			p:ignoreUnresolvablePlaceholders="true" 
			p:properties-ref="applicationProps" />

		<util:properties id="connectionProps" location="WEB-INF/connection.properties" />
		<bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer" 
			p:properties-ref="connectionProps" />

What do you know, it works!

src: http://forum.spring.io/forum/spring-projects/container/20874-multiple-propertyplaceholderconfigurer-s